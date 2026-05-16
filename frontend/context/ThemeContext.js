import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    (async () => {
      const storedTheme = await AsyncStorage.getItem('@dark_theme');
      if (storedTheme === 'true') {
        setIsDark(true);
      }
    })();
  }, []);

  const toggleTheme = async (value) => {
    setIsDark(value);
    await AsyncStorage.setItem('@dark_theme', value ? 'true' : 'false');
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
