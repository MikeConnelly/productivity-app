import { useNavigate } from 'react-router-dom';
import type { Log, LogEntry } from '../../api/logs';

interface LogEntryCardProps {
  log: Log;
  entry?: LogEntry;
  date: string;
}

export function LogEntryCard({ log, entry, date }: LogEntryCardProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/logs/${log.logId}/entries/${date}`)}
      className="w-full flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border-l-4 hover:shadow-md transition-shadow text-left"
      style={{ borderLeftColor: log.color }}
    >
      <span className="text-xl flex-shrink-0">{log.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">{log.name}</p>
        {entry?.content ? (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{entry.content}</p>
        ) : (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Write entry...</p>
        )}
      </div>
    </button>
  );
}
