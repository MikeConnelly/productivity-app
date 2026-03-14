import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2 } from 'lucide-react';
import { useHabits } from '../hooks/useHabits';
import { habitsApi } from '../api/habits';
import { useHabitHistory } from '../hooks/useHabitHistory';
import { HeatmapChart } from '../components/habits/HeatmapChart';
import { StreakChart } from '../components/habits/StreakChart';
import { StreakBadge } from '../components/habits/StreakBadge';
import { HabitForm } from '../components/habits/HabitForm';
import { Skeleton } from '../components/Skeleton';
import { format, parseISO } from 'date-fns';

export function HabitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { habits, loading: habitsLoading, setHabits } = useHabits();
  const { history, loading: historyLoading } = useHabitHistory(id ?? '');
  const [showForm, setShowForm] = useState(false);

  const habit = habits.find((h) => h.habitId === id);

  const handleUpdate = async (data: { name: string; color: string; icon: string }) => {
    if (!habit) return;
    const updated = await habitsApi.update(habit.habitId, data);
    setHabits((prev) => prev.map((h) => (h.habitId === habit.habitId ? { ...h, ...updated } : h)));
  };

  const handleDelete = async () => {
    if (!habit) return;
    if (!confirm('Delete this habit? This cannot be undone.')) return;
    setHabits((prev) => prev.filter((h) => h.habitId !== habit.habitId));
    await habitsApi.delete(habit.habitId);
    navigate('/');
  };

  if (habitsLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!habit) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">Habit not found</p>
        <Link to="/" className="text-indigo-600 text-sm mt-2 inline-block">← Back to today</Link>
      </div>
    );
  }

  const recentCompletions = [...history]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/" className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 -ml-2">
          <ArrowLeft size={20} />
        </Link>
        <span className="text-2xl">{habit.icon}</span>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex-1 min-w-0 truncate">{habit.name}</h1>
        <button
          onClick={() => setShowForm(true)}
          className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Edit habit"
        >
          <Edit2 size={18} />
        </button>
        <button
          onClick={handleDelete}
          className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Delete habit"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <StreakBadge
        currentStreak={habit.currentStreak}
        longestStreak={habit.longestStreak}
      />

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
          Last 12 Months
        </h2>
        {historyLoading ? (
          <Skeleton className="h-28 w-full" />
        ) : (
          <HeatmapChart history={history} color={habit.color} />
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
          Weekly Completions (Last 16 weeks)
        </h2>
        {historyLoading ? (
          <Skeleton className="h-44 w-full" />
        ) : (
          <StreakChart history={history} color={habit.color} />
        )}
      </div>

      {recentCompletions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Recent Completions
          </h2>
          <div className="space-y-2">
            {recentCompletions.map((c) => (
              <div key={c.date} className="flex items-start gap-3 py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
                <div
                  className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                  style={{ backgroundColor: habit.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {format(parseISO(c.date), 'EEEE, MMM d, yyyy')}
                  </p>
                  {c.note && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">"{c.note}"</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <HabitForm
          habit={habit}
          onSave={handleUpdate}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
