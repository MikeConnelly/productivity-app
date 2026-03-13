import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import MDEditor from '@uiw/react-md-editor';
import { useJournalEntry } from '../hooks/useJournal';
import { journalApi } from '../api/journal';

export function JournalEntryPage() {
  const { date } = useParams<{ date: string }>();
  const { entry, loading, setEntry } = useJournalEntry(date ?? '');
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialized = useRef(false);

  // Initialize content from entry once loaded
  useEffect(() => {
    if (!loading && !initialized.current) {
      setContent(entry?.content ?? '');
      initialized.current = true;
    }
  }, [loading, entry]);

  const save = useCallback(async (value: string) => {
    if (!date) return;
    setSaveStatus('saving');
    try {
      const saved = await journalApi.upsert(date, value);
      setEntry(saved);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('idle');
    }
  }, [date, setEntry]);

  const handleChange = (value?: string) => {
    const v = value ?? '';
    setContent(v);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => save(v), 2000);
  };

  const displayDate = date ? format(parseISO(date), 'EEEE, MMMM d, yyyy') : '';

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/journal" className="p-2 text-gray-400 hover:text-gray-600 -ml-2">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{displayDate}</h1>
            {entry && (
              <p className="text-xs text-gray-400">{entry.wordCount} words</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {saveStatus === 'saving' && (
            <span className="flex items-center gap-1.5 text-gray-400">
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

      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-96 bg-gray-200 rounded-xl" />
        </div>
      ) : (
        <div data-color-mode="light">
          <MDEditor
            value={content}
            onChange={handleChange}
            height={500}
            preview="edit"
            visibleDragbar={false}
          />
        </div>
      )}
    </div>
  );
}
