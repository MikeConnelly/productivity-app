import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { TodayPage } from './pages/TodayPage';
import { HabitsPage } from './pages/HabitsPage';
import { HabitDetailPage } from './pages/HabitDetailPage';
import { JournalPage } from './pages/JournalPage';
import { JournalEntryPage } from './pages/JournalEntryPage';
import { LogsPage } from './pages/LogsPage';
import { LogDetailPage } from './pages/LogDetailPage';
import { LogEntryPage } from './pages/LogEntryPage';
import { CalendarPage } from './pages/CalendarPage';

export default function App() {
  return (
    <Authenticator>
      {() => (
        <BrowserRouter>
          <AppShell>
            <Routes>
              <Route path="/" element={<TodayPage />} />
              <Route path="/habits" element={<HabitsPage />} />
              <Route path="/habits/:id" element={<HabitDetailPage />} />
              <Route path="/journal" element={<JournalPage />} />
              <Route path="/journal/:date" element={<JournalEntryPage />} />
              <Route path="/logs" element={<LogsPage />} />
              <Route path="/logs/:logId" element={<LogDetailPage />} />
              <Route path="/logs/:logId/entries/:date" element={<LogEntryPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
            </Routes>
          </AppShell>
        </BrowserRouter>
      )}
    </Authenticator>
  );
}
