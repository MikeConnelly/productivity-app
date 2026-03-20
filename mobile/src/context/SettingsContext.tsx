import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type WeekStart = 0 | 1;

interface SettingsContextValue {
  weekStartsOn: WeekStart;
  setWeekStartsOn: (v: WeekStart) => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  weekStartsOn: 0,
  setWeekStartsOn: () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [weekStartsOn, setWeekStartsOnState] = useState<WeekStart>(0);

  useEffect(() => {
    AsyncStorage.getItem('weekStartsOn').then((stored) => {
      if (stored === '1') setWeekStartsOnState(1);
    });
  }, []);

  const setWeekStartsOn = (v: WeekStart) => {
    setWeekStartsOnState(v);
    AsyncStorage.setItem('weekStartsOn', String(v));
  };

  return (
    <SettingsContext.Provider value={{ weekStartsOn, setWeekStartsOn }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
