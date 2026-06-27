import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getParkKey, normalizeParkForStorage } from '../utils/parkKey';
import { apiFetch } from '../utils/apiClient';
import { useUser } from './UserContext';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user, token } = useUser();
  const [favorites, setFavorites] = useState([]);
  const [ready, setReady] = useState(false);

  const loadFromServer = useCallback(async () => {
    if (!user?.id || !token) {
      setFavorites([]);
      setReady(true);
      return;
    }

    try {
      const { response, data } = await apiFetch('/api/favorites');
      if (response.ok && data.success) {
        setFavorites(data.favorites.map((f) => f.park).filter(Boolean));
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Favoriler yüklenemedi:', error);
      setFavorites([]);
    } finally {
      setReady(true);
    }
  }, [user?.id, token]);

  useEffect(() => {
    setReady(false);
    loadFromServer();
  }, [loadFromServer]);

  const isFavorite = useCallback(
    (park) => {
      const key = getParkKey(park);
      return favorites.some((p) => getParkKey(p) === key);
    },
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (park) => {
      if (!user?.id || !token) {
        return { ok: false, message: 'Favoriler için giriş yapın.' };
      }

      const key = getParkKey(park);
      const exists = favorites.some((p) => getParkKey(p) === key);

      try {
        if (exists) {
          const { response, data } = await apiFetch(
            `/api/favorites/${encodeURIComponent(key)}`,
            { method: 'DELETE' }
          );
          if (response.ok) {
            setFavorites((prev) => prev.filter((p) => getParkKey(p) !== key));
            return { ok: true };
          }
          return { ok: false, message: data.message };
        }

        const normalized = normalizeParkForStorage(park);
        const { response, data } = await apiFetch('/api/favorites', {
          method: 'POST',
          body: JSON.stringify({
            parkOsmId: key,
            parkName: park.name,
            parkLocation: park.location,
            parkData: normalized,
          }),
        });

        if (response.ok) {
          setFavorites((prev) => [normalized, ...prev]);
          return { ok: true };
        }
        return { ok: false, message: data.message };
      } catch (error) {
        return { ok: false, message: error.message };
      }
    },
    [favorites, user?.id, token]
  );

  const getFavoriteParks = useCallback(() => favorites, [favorites]);

  const value = useMemo(
    () => ({
      ready,
      favorites,
      isFavorite,
      toggleFavorite,
      getFavoriteParks,
      refreshFavorites: loadFromServer,
    }),
    [ready, favorites, isFavorite, toggleFavorite, getFavoriteParks, loadFromServer]
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
