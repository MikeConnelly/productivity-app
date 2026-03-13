import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, ChevronRight } from 'lucide-react';
import { useHabits } from '../hooks/useHabits';
import { habitsApi } from '../api/habits';
import { HabitForm } from '../components/habits/HabitForm';
import { HabitCardSkeleton } from '../components/Skeleton';
import type { Habit } from '../api/habits';

export function HabitsPage() {
  const { habits, loading, setHabits } = useHabits();
  const [showForm, setShowForm] = useState(false);
  const [editHabit, setEditHabit] = useState<Habit | null>(null);

  const handleCreate = async (data: { name: string; color: string; icon: string }) => {
    const newHabit = await habitsApi.create(data);
    setHabits((prev) => [...prev, newHabit]);
  };

  const handleUpdate = async (data: { name: string; color: string; icon: string }) => {
    if (!editHabit) return;
    const updated = await habitsApi.update(editHabit.habitId, data);
    setHabits((prev) => prev.map((h) => (h.habitId === editHabit.habitId ? { ...h, ...updated } : h)));
  };

  const handleDelete = async (habitId: string) => {
    if (!confirm('Delete this habit? This cannot be undone.')) return;
    setHabits((prev) => prev.filter((h) => h.habitId !== habitId));
    await habitsApi.delete(habitId);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Habits</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          New Habit
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <HabitCardSkeleton key={i} />)}
        </div>
      ) : habits.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500 mb-4">No habits yet. Start building good habits!</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            Create First Habit
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => (
            <div
              key={habit.habitId}
              className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border-l-4"
              style={{ borderLeftColor: habit.color }}
            >
              <span className="text-xl">{habit.icon}</span>
              <Link
                to={`/habits/${habit.habitId}`}
                className="flex-1 min-w-0"
              >
                <p className="font-medium text-gray-900 truncate">{habit.name}</p>
                <p className="text-xs text-gray-400">
                  🔥 {habit.currentStreak} day streak · Best: {habit.longestStreak}
                </p>
              </Link>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { setEditHabit(habit); setShowForm(true); }}
                  className="p-2 text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(habit.habitId)}
                  className="p-2 text-gray-400 hover:text-red-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <Trash2 size={16} />
                </button>
                <Link
                  to={`/habits/${habit.habitId}`}
                  className="p-2 text-gray-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <HabitForm
          habit={editHabit ?? undefined}
          onSave={editHabit ? handleUpdate : handleCreate}
          onClose={() => { setShowForm(false); setEditHabit(null); }}
        />
      )}
    </div>
  );
}
