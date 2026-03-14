import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Expand } from 'lucide-react';
import { type Habit, type Completion } from '../../api/habits';
import { logsApi, type Log, type LogEntry } from '../../api/logs';
import { journalApi, type JournalEntry } from '../../api/journal';

interface DayDetailProps {
  date: string;
  habits: Habit[];
  completions: Completion[];
  logs: Log[];
}

export function DayDetail({ date, habits, completions, logs }: DayDetailProps) {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [journal, setJournal] = useState<JournalEntry | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(true);

  useEffect(() => {
    setLoadingDetail(true);
    Promise.all([
      logsApi.getDayEntries(date).catch(() => [] as LogEntry[]),
      journalApi.get(date).catch(() => null),
    ]).then(([entries, entry]) => {
      setLogEntries(entries);
      setJournal(entry);
      setLoadingDetail(false);
    });
  }, [date]);

  const completedIds = new Set(completions.map((c) => c.habitId));

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
          <ul className="space-y-1">
            {habits.map((habit) => (
              <li key={habit.habitId} className="flex items-center gap-2 text-sm">
                {completedIds.has(habit.habitId) ? (
                  <span className="text-indigo-600 font-bold">✓</span>
                ) : (
                  <span className="text-gray-300 dark:text-gray-600">–</span>
                )}
                <span className={completedIds.has(habit.habitId) ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}>
                  {habit.name}
                </span>
              </li>
            ))}
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

      {/* Journal */}
      <section>
        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Journal</h4>
        {loadingDetail ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">Loading...</p>
        ) : journal ? (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{journal.content}</p>
            <Link to={`/journal/${date}`} className="text-xs text-indigo-600 hover:underline mt-1 inline-block">
              Open entry →
            </Link>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-400 dark:text-gray-500">No entry</p>
            <Link to={`/journal/${date}`} className="text-xs text-indigo-600 hover:underline mt-1 inline-block">
              Write entry →
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
