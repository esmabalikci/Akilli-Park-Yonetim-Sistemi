import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getParkKey, normalizeParkForStorage } from '../utils/parkKey';

const STORAGE_KEY = '@apays_favorites_v1';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const [commentsByPark, setCommentsByPark] = useState({});
  const [ready, setReady] = useState(false);

  const save = useCallback(async (favs, comments) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ favorites: favs, commentsByPark: comments })
      );
    } catch (e) {
      console.error('Favoriler kaydedilemedi:', e);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setFavorites(parsed.favorites || []);
          setCommentsByPark(parsed.commentsByPark || {});
        }
      } catch (e) {
        console.error('Favoriler yüklenemedi:', e);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const isFavorite = useCallback(
    (park) => {
      const key = getParkKey(park);
      return favorites.some((p) => getParkKey(p) === key);
    },
    [favorites]
  );

  const toggleFavorite = useCallback(
    (park) => {
      const key = getParkKey(park);
      const normalized = normalizeParkForStorage(park);
      setFavorites((prev) => {
        const exists = prev.some((p) => getParkKey(p) === key);
        const nextFavs = exists
          ? prev.filter((p) => getParkKey(p) !== key)
          : [normalized, ...prev];
        save(nextFavs, commentsByPark);
        return nextFavs;
      });
    },
    [commentsByPark, save]
  );

  const addComment = useCallback(
    (park, text, author) => {
      const key = getParkKey(park);
      const trimmed = text?.trim();
      if (!trimmed) return false;

      const entry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        parkKey: key,
        userName: author?.full_name || 'Kullanıcı',
        userId: author?.id ?? null,
        text: trimmed,
        createdAt: new Date().toISOString(),
      };

      setCommentsByPark((prevComments) => {
        const nextComments = {
          ...prevComments,
          [key]: [entry, ...(prevComments[key] || [])],
        };

        setFavorites((prevFavs) => {
          const inFavs = prevFavs.some((p) => getParkKey(p) === key);
          const nextFavs = inFavs
            ? prevFavs
            : [normalizeParkForStorage(park), ...prevFavs];
          save(nextFavs, nextComments);
          return nextFavs;
        });

        return nextComments;
      });

      return true;
    },
    [save]
  );

  const getComments = useCallback(
    (park) => commentsByPark[getParkKey(park)] || [],
    [commentsByPark]
  );

  const deleteComment = useCallback(
    (park, commentId) => {
      const key = getParkKey(park);
      setCommentsByPark((prev) => {
        const parkComments = prev[key] || [];
        const nextComments = {
          ...prev,
          [key]: parkComments.filter((c) => c.id !== commentId),
        };
        save(favorites, nextComments);
        return nextComments;
      });
    },
    [favorites, save]
  );

  const editComment = useCallback(
    (park, commentId, newText) => {
      const key = getParkKey(park);
      const trimmed = newText?.trim();
      if (!trimmed) return false;

      setCommentsByPark((prev) => {
        const parkComments = prev[key] || [];
        const nextComments = {
          ...prev,
          [key]: parkComments.map((c) =>
            c.id === commentId ? { ...c, text: trimmed, isEdited: true } : c
          ),
        };
        save(favorites, nextComments);
        return nextComments;
      });
      return true;
    },
    [favorites, save]
  );

  const getFavoriteWithComments = useCallback(
    () =>
      favorites.map((park) => ({
        park,
        comments: commentsByPark[getParkKey(park)] || [],
      })),
    [favorites, commentsByPark]
  );

  const value = useMemo(
    () => ({
      ready,
      favorites,
      isFavorite,
      toggleFavorite,
      addComment,
      getComments,
      getFavoriteWithComments,
      deleteComment,
      editComment,
    }),
    [
      ready,
      favorites,
      isFavorite,
      toggleFavorite,
      addComment,
      getComments,
      getFavoriteWithComments,
      deleteComment,
      editComment,
    ]
  );

  return (
    <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return ctx;
}
