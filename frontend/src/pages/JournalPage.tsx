import { Link } from 'react-router-dom';
import { Plus, FileText } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useJournalEntries } from '../hooks/useJournal';
import { Skeleton } from '../components/Skeleton';

export function JournalPage() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const { entries, loading } = useJournalEntries();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Journal</h1>
        <Link
          to={`/journal/${today}`}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          <Plus size={16} />
          Today's Entry
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-4">
              <Skeleton className="h-5 w-36 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <FileText size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-3">No journal entries yet</p>
          <Link
            to={`/journal/${today}`}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            Write Today's Entry
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => {
            const date = parseISO(entry.date);
            const preview = entry.content.replace(/[#*`\[\]]/g, '').trim();
            return (
              <Link
                key={entry.date}
                to={`/journal/${entry.date}`}
                className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-900">
                    {format(date, 'EEEE, MMMM d, yyyy')}
                  </p>
                  <span className="text-xs text-gray-400">{entry.wordCount} words</span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{preview}</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
