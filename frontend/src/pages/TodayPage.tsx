import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { BookOpen } from 'lucide-react';
import { useHabits, useTodayCompletions } from '../hooks/useHabits';
import { habitsApi, type Completion } from '../api/habits';
import { HabitCard } from '../components/habits/HabitCard';
import { HabitCardSkeleton } from '../components/Skeleton';
import { useLogs, useDayLogEntries } from '../hooks/useLogs';
import { LogEntryCard } from '../components/logs/LogEntryCard';

export function TodayPage() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const displayDate = format(new Date(), 'EEEE, MMMM d');
  const { habits, loading: habitsLoading } = useHabits();
  const { completions, setCompletions, loading: completionsLoading } = useTodayCompletions(today);
  const { logs, loading: logsLoading } = useLogs();
  const { logEntries, loading: logEntriesLoading } = useDayLogEntries(today);
  const [storedDate, setStoredDate] = useState(today);

  // Detect stale date on focus
  useEffect(() => {
    const handleFocus = () => {
      const currentDate = format(new Date(), 'yyyy-MM-dd');
      if (storedDate !== currentDate) {
        setStoredDate(currentDate);
        window.location.reload();
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [storedDate]);

  const handleToggle = useCallback(async (habitId: string, completed: boolean, note?: string) => {
    if (completed) {
      // Optimistic update
      setCompletions((prev) => {
        const filtered = prev.filter((c) => c.habitId !== habitId);
        return [...filtered, { habitId, date: today, completedAt: new Date().toISOString(), note }];
      });
      try {
        await habitsApi.complete(habitId, today, note);
      } catch {
        setCompletions((prev) => prev.filter((c) => c.habitId !== habitId));
      }
    } else {
      setCompletions((prev) => prev.filter((c) => c.habitId !== habitId));
      try {
        await habitsApi.uncomplete(habitId, today);
      } catch {
        // restore on error
        const restored: Completion = { habitId, date: today, completedAt: new Date().toISOString() };
        setCompletions((prev) => [...prev, restored]);
      }
    }
  }, [today, setCompletions]);

  const completionMap = new Map(completions.map((c) => [c.habitId, c]));
  const completedCount = completions.length;
  const totalCount = habits.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const loading = habitsLoading || completionsLoading;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{displayDate}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {completedCount}/{totalCount} habits completed
        </p>
        {totalCount > 0 && (
          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Today's Habits
        </h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <HabitCardSkeleton key={i} />)}
          </div>
        ) : habits.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500 mb-3">No habits yet</p>
            <Link to="/habits" className="text-indigo-600 font-medium text-sm hover:underline">
              Create your first habit →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map((habit) => (
              <HabitCard
                key={habit.habitId}
                habit={habit}
                completion={completionMap.get(habit.habitId)}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Daily Logs</h2>
        {logsLoading || logEntriesLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <HabitCardSkeleton key={i} />)}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500 mb-2 text-sm">No logs yet</p>
            <Link to="/logs" className="text-indigo-600 font-medium text-sm hover:underline">
              Create your first log →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {(() => {
              const entryMap = new Map(logEntries.map((e) => [e.logId, e]));
              return logs.map((log) => (
                <LogEntryCard
                  key={log.logId}
                  log={log}
                  entry={entryMap.get(log.logId)}
                  date={today}
                />
              ));
            })()}
          </div>
        )}
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Journal</h2>
        </div>
        <Link
          to={`/journal/${today}`}
          className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="p-2 bg-indigo-50 rounded-lg">
            <BookOpen size={20} className="text-indigo-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Today's Journal</p>
            <p className="text-xs text-gray-400">Write about your day</p>
          </div>
        </Link>
      </section>
    </div>
  );
}
