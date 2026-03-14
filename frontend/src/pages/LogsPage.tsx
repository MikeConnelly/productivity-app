import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, ChevronRight } from 'lucide-react';
import { useLogs } from '../hooks/useLogs';
import { logsApi } from '../api/logs';
import { LogForm } from '../components/logs/LogForm';
import { HabitCardSkeleton } from '../components/Skeleton';
import type { Log } from '../api/logs';

export function LogsPage() {
  const { logs, loading, setLogs } = useLogs();
  const [showForm, setShowForm] = useState(false);
  const [editLog, setEditLog] = useState<Log | null>(null);

  const handleCreate = async (data: { name: string; color: string; icon: string }) => {
    const newLog = await logsApi.create(data);
    setLogs((prev) => [...prev, newLog]);
  };

  const handleUpdate = async (data: { name: string; color: string; icon: string }) => {
    if (!editLog) return;
    const updated = await logsApi.update(editLog.logId, data);
    setLogs((prev) => prev.map((l) => (l.logId === editLog.logId ? { ...l, ...updated } : l)));
  };

  const handleDelete = async (logId: string) => {
    if (!confirm('Delete this log? This cannot be undone.')) return;
    setLogs((prev) => prev.filter((l) => l.logId !== logId));
    await logsApi.delete(logId);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Logs</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          New Log
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <HabitCardSkeleton key={i} />)}
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No logs yet. Start tracking daily topics!</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            Create First Log
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.logId}
              className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border-l-4"
              style={{ borderLeftColor: log.color }}
            >
              <span className="text-xl">{log.icon}</span>
              <Link to={`/logs/${log.logId}`} className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{log.name}</p>
              </Link>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { setEditLog(log); setShowForm(true); }}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(log.logId)}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <Trash2 size={16} />
                </button>
                <Link
                  to={`/logs/${log.logId}`}
                  className="p-2 text-gray-400 dark:text-gray-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <LogForm
          log={editLog ?? undefined}
          onSave={editLog ? handleUpdate : handleCreate}
          onClose={() => { setShowForm(false); setEditLog(null); }}
        />
      )}
    </div>
  );
}
