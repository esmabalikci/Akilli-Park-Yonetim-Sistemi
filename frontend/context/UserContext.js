import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { getStoredUser, getStoredToken, saveSession, clearSession } from '../utils/apiClient';
import { registerForPushNotifications } from '../utils/pushNotifications';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    (async () => {
      const storedUser = await getStoredUser();
      const storedToken = await getStoredToken();
      if (storedUser && storedToken) {
        setUser(storedUser);
        setToken(storedToken);
        registerForPushNotifications(storedUser.id);
      }
      setBootstrapping(false);
    })();
  }, []);

  const setSession = useCallback(async (nextUser, nextToken) => {
    setUser(nextUser);
    setToken(nextToken);
    if (nextUser && nextToken) {
      await saveSession(nextUser, nextToken);
      registerForPushNotifications(nextUser.id);
    }
  }, []);

  const clearUser = useCallback(async () => {
    setUser(null);
    setToken(null);
    await clearSession();
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      bootstrapping,
      setUser,
      setSession,
      clearUser,
    }),
    [user, token, bootstrapping, setSession, clearUser]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUser must be used within UserProvider');
  }
  return ctx;
}
