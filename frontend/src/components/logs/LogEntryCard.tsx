import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, MessageSquare } from 'lucide-react';
import type { Log, LogEntry } from '../../api/logs';

interface LogEntryCardProps {
  log: Log;
  entry?: LogEntry;
  date: string;
}

export function LogEntryCard({ log, entry, date }: LogEntryCardProps) {
  const navigate = useNavigate();
  const isComplete = !!entry?.content;
  const editUrl = `/logs/${log.logId}/entries/${date}`;

  return (
    <div
      className={`flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border-l-4 transition-all ${isComplete ? 'opacity-75' : ''}`}
      style={{ borderLeftColor: log.color }}
    >
      {/* MessageSquare "checkbox" */}
      <button
        onClick={() => navigate(editUrl)}
        className="flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors min-h-[44px] min-w-[44px] -ml-2"
        style={{
          borderColor: isComplete ? log.color : '#d1d5db',
          backgroundColor: isComplete ? log.color : 'transparent',
        }}
        aria-label={`Edit ${log.name} entry`}
      >
        <MessageSquare
          size={14}
          className={isComplete ? 'text-white' : 'text-gray-400 dark:text-gray-500'}
          fill={isComplete ? 'white' : 'none'}
        />
      </button>

      {/* Content — also tappable to edit */}
      <button
        onClick={() => navigate(editUrl)}
        className="flex items-center gap-3 flex-1 min-w-0 text-left"
      >
        <span className="text-xl flex-shrink-0">{log.icon}</span>
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm truncate ${isComplete ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
            {log.name}
          </p>
          {entry?.content ? (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{entry.content}</p>
          ) : (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Write entry...</p>
          )}
        </div>
      </button>

      {/* History link */}
      <Link
        to={`/logs/${log.logId}`}
        className="flex-shrink-0 p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="View log history"
      >
        <ChevronRight size={18} />
      </Link>
    </div>
  );
}
