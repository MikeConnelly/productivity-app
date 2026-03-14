import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useLogs } from '../hooks/useLogs';
import { useLogHistory } from '../hooks/useLogs';
import { Skeleton } from '../components/Skeleton';

export function LogDetailPage() {
  const { logId } = useParams<{ logId: string }>();
  const { logs, loading: logsLoading } = useLogs();
  const { history, loading: historyLoading } = useLogHistory(logId ?? '');

  const log = logs.find((l) => l.logId === logId);

  if (logsLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!log) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">Log not found</p>
        <Link to="/logs" className="text-indigo-600 text-sm mt-2 inline-block">← Back to logs</Link>
      </div>
    );
  }

  const sortedHistory = [...history].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/logs" className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 -ml-2">
          <ArrowLeft size={20} />
        </Link>
        <span className="text-2xl">{log.icon}</span>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{log.name}</h1>
      </div>

      {historyLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
              <Skeleton className="h-5 w-36 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : sortedHistory.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <p className="text-gray-500 dark:text-gray-400">No entries yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Write your first entry from the Today page</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedHistory.map((entry) => (
            <Link
              key={entry.date}
              to={`/logs/${logId}/entries/${entry.date}`}
              className="block bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border-l-4 hover:shadow-md transition-shadow"
              style={{ borderLeftColor: log.color }}
            >
              <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                {format(parseISO(entry.date), 'EEEE, MMMM d, yyyy')}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{entry.content}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
