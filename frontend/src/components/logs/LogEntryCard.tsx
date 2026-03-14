import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { Log, LogEntry } from '../../api/logs';

interface LogEntryCardProps {
  log: Log;
  entry?: LogEntry;
  date: string;
}

export function LogEntryCard({ log, entry, date }: LogEntryCardProps) {
  const navigate = useNavigate();

  return (
    <div
      className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border-l-4"
      style={{ borderLeftColor: log.color }}
    >
      <button
        onClick={() => navigate(`/logs/${log.logId}/entries/${date}`)}
        className="flex items-center gap-3 flex-1 min-w-0 text-left"
        aria-label={`Edit ${log.name} entry`}
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

      <Link
        to={`/logs/${log.logId}`}
        className="flex-shrink-0 p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="View log history"
      >
        <ChevronRight size={16} />
      </Link>
    </div>
  );
}
