import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useLogs } from '../hooks/useLogs';
import { logsApi } from '../api/logs';

export function LogEntryPage() {
  const { logId, date } = useParams<{ logId: string; date: string }>();
  const { logs, loading: logsLoading } = useLogs();
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialized = useRef(false);

  const log = logs.find((l) => l.logId === logId);

  useEffect(() => {
    if (!logId || !date || initialized.current) return;
    initialized.current = true;
    logsApi.getEntry(logId, date).then((entry) => {
      setContent(entry.content);
    }).catch(() => {
      // No entry yet, start empty
    });
  }, [logId, date]);

  const save = useCallback(async (value: string) => {
    if (!logId || !date) return;
    setSaveStatus('saving');
    try {
      await logsApi.upsertEntry(logId, date, value);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('idle');
    }
  }, [logId, date]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setContent(v);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => save(v), 1500);
  };

  const displayDate = date ? format(parseISO(date), 'EEEE, MMMM d, yyyy') : '';

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to={`/logs/${logId}`} className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 -ml-2">
            <ArrowLeft size={20} />
          </Link>
          <div>
            {!logsLoading && log && (
              <div className="flex items-center gap-2 mb-0.5">
                <span>{log.icon}</span>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{log.name}</span>
              </div>
            )}
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{displayDate}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {saveStatus === 'saving' && (
            <span className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500">
              <Loader2 size={14} className="animate-spin" />
              Saving...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1.5 text-green-500">
              <Check size={14} />
              Saved
            </span>
          )}
          <button
            onClick={() => {
              if (saveTimeout.current) clearTimeout(saveTimeout.current);
              save(content);
            }}
            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            Save
          </button>
        </div>
      </div>

      <textarea
        value={content}
        onChange={handleChange}
        placeholder="Write your entry..."
        className="w-full h-64 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none shadow-sm"
        autoFocus
      />
    </div>
  );
}
