import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { parse, format } from 'date-fns';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useHabits, useTodayCompletions } from '../hooks/useHabits';
import { habitsApi, type Completion } from '../api/habits';
import { HabitCard } from '../components/habits/HabitCard';
import { HabitCardSkeleton } from '../components/Skeleton';
import { useLogs, useDayLogEntries } from '../hooks/useLogs';
import { LogEntryCard } from '../components/logs/LogEntryCard';

export function DayPage() {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const parsedDate = date ? parse(date, 'yyyy-MM-dd', new Date()) : new Date();
  const displayDate = format(parsedDate, 'EEEE, MMMM d');

  const { habits, loading: habitsLoading } = useHabits();
  const { completions, setCompletions, loading: completionsLoading } = useTodayCompletions(date!);
  const { logs, loading: logsLoading } = useLogs();
  const { logEntries, loading: logEntriesLoading } = useDayLogEntries(date!);

  const [localDate] = useState(date!);

  const handleToggle = useCallback(async (habitId: string, completed: boolean, note?: string) => {
    if (completed) {
      setCompletions((prev) => {
        const filtered = prev.filter((c) => c.habitId !== habitId);
        return [...filtered, { habitId, date: localDate, completedAt: new Date().toISOString(), note }];
      });
      try {
        await habitsApi.complete(habitId, localDate, note);
        queryClient.invalidateQueries({ queryKey: ['year-heatmap-habits-range'] });
      } catch {
        setCompletions((prev) => prev.filter((c) => c.habitId !== habitId));
      }
    } else {
      setCompletions((prev) => prev.filter((c) => c.habitId !== habitId));
      try {
        await habitsApi.uncomplete(habitId, localDate);
        queryClient.invalidateQueries({ queryKey: ['year-heatmap-habits-range'] });
      } catch {
        const restored: Completion = { habitId, date: localDate, completedAt: new Date().toISOString() };
        setCompletions((prev) => [...prev, restored]);
      }
    }
  }, [localDate, setCompletions, queryClient]);

  const completionMap = new Map(completions.map((c) => [c.habitId, c]));
  const completedCount = completions.length;
  const totalCount = habits.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const loading = habitsLoading || completionsLoading;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{displayDate}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {completedCount}/{totalCount} habits completed
        </p>
        {totalCount > 0 && (
          <div className="mt-3 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      <section>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          Habits
        </h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <HabitCardSkeleton key={i} />)}
          </div>
        ) : habits.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <p className="text-gray-500 dark:text-gray-400 mb-3">No active habits</p>
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
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Daily Logs</h2>
        {logsLoading || logEntriesLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <HabitCardSkeleton key={i} />)}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <p className="text-gray-500 dark:text-gray-400 mb-2 text-sm">No active logs</p>
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
                  date={date!}
                />
              ));
            })()}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Journal</h2>
        <Link
          to={`/journal/${date}`}
          className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/50 rounded-lg">
            <BookOpen size={20} className="text-indigo-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{displayDate}'s Journal</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">View or write entry</p>
          </div>
        </Link>
      </section>
    </div>
  );
}
