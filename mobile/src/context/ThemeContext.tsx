import { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'system',
  isDark: false,
  setTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>('system');

  useEffect(() => {
    AsyncStorage.getItem('theme').then((stored) => {
      if (stored === 'dark' || stored === 'light' || stored === 'system') {
        setThemeState(stored);
      }
    });
  }, []);

  const isDark =
    theme === 'dark' || (theme === 'system' && systemScheme === 'dark');

  const setTheme = (t: Theme) => {
    setThemeState(t);
    AsyncStorage.setItem('theme', t);
  };

  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
