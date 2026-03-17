import { createContext, useContext, useState } from 'react';

type WeekStart = 0 | 1;

const SettingsContext = createContext<{ weekStartsOn: WeekStart; setWeekStartsOn: (v: WeekStart) => void }>({
  weekStartsOn: 0,
  setWeekStartsOn: () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [weekStartsOn, setWeekStartsOnState] = useState<WeekStart>(() => {
    const stored = localStorage.getItem('weekStartsOn');
    return stored === '1' ? 1 : 0;
  });

  const setWeekStartsOn = (v: WeekStart) => {
    localStorage.setItem('weekStartsOn', String(v));
    setWeekStartsOnState(v);
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
