import { Link } from 'react-router-dom';
import { Expand } from 'lucide-react';
import { type Habit, type Completion } from '../../api/habits';
import { type Log } from '../../api/logs';
import { useDayLogEntries } from '../../hooks/useLogs';

interface DayDetailProps {
  date: string;
  habits: Habit[];
  completions: Completion[];
  logs: Log[];
  onToggle?: (habitId: string, completed: boolean, date: string, note?: string) => void;
}

export function DayDetail({ date, habits, completions, logs, onToggle }: DayDetailProps) {
  const { logEntries, loading: logEntriesLoading } = useDayLogEntries(date);
  const loadingDetail = logEntriesLoading;

  const completionMap = new Map(completions.map((c) => [c.habitId, c]));

  const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 min-w-0 truncate">{displayDate}</h3>
        <Link
          to={`/day/${date}`}
          className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 shrink-0"
          title="Open full page view"
        >
          <Expand size={14} />
          Full view
        </Link>
      </div>

      {/* Habits */}
      <section>
        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Habits</h4>
        {habits.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">No active habits</p>
        ) : (
          <ul className="space-y-2">
            {habits.map((habit) => {
              const completion = completionMap.get(habit.habitId);
              const isCompleted = !!completion;
              return (
                <li key={habit.habitId} className="flex items-start gap-2 text-sm">
                  <button
                    onClick={() => {
                      if (!onToggle) return;
                      if (isCompleted && completion?.note) {
                        if (!window.confirm('This completion has a note attached. Are you sure you want to remove it?')) return;
                      }
                      onToggle(habit.habitId, !isCompleted, date);
                    }}
                    disabled={!onToggle}
                    className="flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors mt-0.5"
                    style={{
                      borderColor: isCompleted ? habit.color : '#d1d5db',
                      backgroundColor: isCompleted ? habit.color : 'transparent',
                      cursor: onToggle ? 'pointer' : 'default',
                    }}
                    aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {isCompleted && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <div className="min-w-0">
                    <span className={isCompleted ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}>
                      {habit.name}
                    </span>
                    {completion?.note && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate">"{completion.note}"</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Logs */}
      <section>
        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Logs</h4>
        {loadingDetail ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">Loading...</p>
        ) : logs.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">No active logs</p>
        ) : (
          <ul className="space-y-1">
            {logs.map((log) => {
              const entry = logEntries.find((e) => e.logId === log.logId);
              return (
                <li key={log.logId} className="flex items-start gap-2 text-sm min-w-0">
                  <span className="mt-0.5 shrink-0">{log.icon}</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300 shrink-0">{log.name}:</span>
                  {entry ? (
                    <Link
                      to={`/logs/${log.logId}/entries/${date}`}
                      className="text-indigo-600 hover:underline truncate min-w-0"
                    >
                      {entry.content}
                    </Link>
                  ) : (
                    <span className="text-gray-300 dark:text-gray-600 shrink-0">—</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

    </div>
  );
}
