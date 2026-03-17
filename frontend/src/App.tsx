import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { TodayPage } from './pages/TodayPage';
import { HabitDetailPage } from './pages/HabitDetailPage';
import { LogDetailPage } from './pages/LogDetailPage';
import { LogEntryPage } from './pages/LogEntryPage';
import { CalendarPage } from './pages/CalendarPage';
import { DayPage } from './pages/DayPage';
import { SettingsPage } from './pages/SettingsPage';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider } from './context/SettingsContext';

export default function App() {
  return (
    <ThemeProvider>
    <SettingsProvider>
    <Authenticator>
      {() => (
        <BrowserRouter>
          <AppShell>
            <Routes>
              <Route path="/" element={<TodayPage />} />
              <Route path="/habits/:id" element={<HabitDetailPage />} />
              <Route path="/logs/:logId" element={<LogDetailPage />} />
              <Route path="/logs/:logId/entries/:date" element={<LogEntryPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/day/:date" element={<DayPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </AppShell>
        </BrowserRouter>
      )}
    </Authenticator>
    </SettingsProvider>
    </ThemeProvider>
  );
}
