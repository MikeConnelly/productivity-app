import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
    <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4 space-y-4">
      <h3 className="font-semibold text-gray-800">{displayDate}</h3>

      {/* Habits */}
      <section>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Habits</h4>
        {habits.length === 0 ? (
          <p className="text-sm text-gray-400">No active habits</p>
        ) : (
          <ul className="space-y-1">
            {habits.map((habit) => (
              <li key={habit.habitId} className="flex items-center gap-2 text-sm">
                {completedIds.has(habit.habitId) ? (
                  <span className="text-indigo-600 font-bold">✓</span>
                ) : (
                  <span className="text-gray-300">–</span>
                )}
                <span className={completedIds.has(habit.habitId) ? 'text-gray-800' : 'text-gray-400'}>
                  {habit.name}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Logs */}
      <section>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Logs</h4>
        {loadingDetail ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : logs.length === 0 ? (
          <p className="text-sm text-gray-400">No active logs</p>
        ) : (
          <ul className="space-y-1">
            {logs.map((log) => {
              const entry = logEntries.find((e) => e.logId === log.logId);
              return (
                <li key={log.logId} className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5">{log.icon}</span>
                  <span className="font-medium text-gray-700 shrink-0">{log.name}:</span>
                  {entry ? (
                    <Link
                      to={`/logs/${log.logId}/entries/${date}`}
                      className="text-indigo-600 hover:underline truncate max-w-xs"
                    >
                      {entry.content}
                    </Link>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Journal */}
      <section>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Journal</h4>
        {loadingDetail ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : journal ? (
          <div>
            <p className="text-sm text-gray-600 line-clamp-2">{journal.content}</p>
            <Link to={`/journal/${date}`} className="text-xs text-indigo-600 hover:underline mt-1 inline-block">
              Open entry →
            </Link>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-400">No entry</p>
            <Link to={`/journal/${date}`} className="text-xs text-indigo-600 hover:underline mt-1 inline-block">
              Write entry →
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
