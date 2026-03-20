import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Plus, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useHabits, useTodayCompletions } from '../hooks/useHabits';
import { habitsApi, type Habit, type Completion } from '../api/habits';
import { HabitCard } from '../components/habits/HabitCard';
import { HabitForm } from '../components/habits/HabitForm';
import { HabitCardSkeleton } from '../components/Skeleton';
import { useLogs, useDayLogEntries } from '../hooks/useLogs';
import { logsApi, type Log, type LogEntry } from '../api/logs';
import { LogEntryCard } from '../components/logs/LogEntryCard';
import { LogForm } from '../components/logs/LogForm';

function SortableHabitRow({
  habit,
  completion,
  onToggle,
}: {
  habit: Habit;
  completion?: Completion;
  onToggle: (habitId: string, completed: boolean, note?: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: habit.habitId,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="flex items-center gap-2"
    >
      <button
        {...attributes}
        {...listeners}
        className="touch-none text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 cursor-grab active:cursor-grabbing flex-shrink-0"
        aria-label="Drag to reorder"
      >
        <GripVertical size={18} />
      </button>
      <div className="flex-1 min-w-0">
        <HabitCard habit={habit} completion={completion} onToggle={onToggle} />
      </div>
    </div>
  );
}

function SortableLogRow({
  log,
  entry,
  date,
}: {
  log: Log;
  entry?: LogEntry;
  date: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: log.logId,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="flex items-center gap-2"
    >
      <button
        {...attributes}
        {...listeners}
        className="touch-none text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 cursor-grab active:cursor-grabbing flex-shrink-0"
        aria-label="Drag to reorder"
      >
        <GripVertical size={18} />
      </button>
      <div className="flex-1 min-w-0">
        <LogEntryCard log={log} entry={entry} date={date} />
      </div>
    </div>
  );
}

export function TodayPage() {
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');
  const displayDate = format(new Date(), 'EEEE, MMMM d');
  const { habits, loading: habitsLoading, setHabits } = useHabits();
  const { completions, setCompletions, loading: completionsLoading } = useTodayCompletions(today);
  const { logs, loading: logsLoading, setLogs } = useLogs();
  const { logEntries, loading: logEntriesLoading } = useDayLogEntries(today);
  const [storedDate, setStoredDate] = useState(today);

  const [showHabitForm, setShowHabitForm] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [reorderingHabits, setReorderingHabits] = useState(false);
  const [reorderingLogs, setReorderingLogs] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // Detect stale date on focus
  useEffect(() => {
    const handleFocus = () => {
      const currentDate = format(new Date(), 'yyyy-MM-dd');
      if (storedDate !== currentDate) {
        setStoredDate(currentDate);
        window.location.reload();
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [storedDate]);

  const handleToggle = useCallback(async (habitId: string, completed: boolean, note?: string) => {
    if (completed) {
      setCompletions((prev) => {
        const filtered = prev.filter((c) => c.habitId !== habitId);
        return [...filtered, { habitId, date: today, completedAt: new Date().toISOString(), note }];
      });
      try {
        const result = await habitsApi.complete(habitId, today, note);
        setHabits((prev) => prev.map((h) => h.habitId === habitId ? { ...h, currentStreak: result.currentStreak, longestStreak: result.longestStreak } : h));
        queryClient.invalidateQueries({ queryKey: ['year-heatmap-habits-range'] });
        queryClient.invalidateQueries({ queryKey: ['completions-range'] });
      } catch {
        setCompletions((prev) => prev.filter((c) => c.habitId !== habitId));
      }
    } else {
      setCompletions((prev) => prev.filter((c) => c.habitId !== habitId));
      try {
        const result = await habitsApi.uncomplete(habitId, today);
        setHabits((prev) => prev.map((h) => h.habitId === habitId ? { ...h, currentStreak: result.currentStreak, longestStreak: result.longestStreak } : h));
        queryClient.invalidateQueries({ queryKey: ['year-heatmap-habits-range'] });
        queryClient.invalidateQueries({ queryKey: ['completions-range'] });
      } catch {
        const restored: Completion = { habitId, date: today, completedAt: new Date().toISOString() };
        setCompletions((prev) => [...prev, restored]);
      }
    }
  }, [today, setCompletions, queryClient]);

  const handleCreateHabit = async (data: { name: string; color: string; icon: string }) => {
    const newHabit = await habitsApi.create(data);
    setHabits((prev) => [...prev, newHabit]);
  };

  const handleCreateLog = async (data: { name: string; color: string; icon: string }) => {
    const newLog = await logsApi.create(data);
    setLogs((prev) => [...prev, newLog]);
  };

  const handleHabitDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setHabits((prev) => {
      const oldIndex = prev.findIndex((h) => h.habitId === active.id);
      const newIndex = prev.findIndex((h) => h.habitId === over.id);
      const newOrder = arrayMove(prev, oldIndex, newIndex);
      habitsApi.reorder(newOrder.map((h) => h.habitId)).catch(console.error);
      return newOrder;
    });
  };

  const handleLogDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setLogs((prev) => {
      const oldIndex = prev.findIndex((l) => l.logId === active.id);
      const newIndex = prev.findIndex((l) => l.logId === over.id);
      const newOrder = arrayMove(prev, oldIndex, newIndex);
      logsApi.reorder(newOrder.map((l) => l.logId)).catch(console.error);
      return newOrder;
    });
  };

  const completionMap = new Map(completions.map((c) => [c.habitId, c]));
  const completedCount = completions.length;
  const totalCount = habits.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const loading = habitsLoading || completionsLoading;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{displayDate}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {completedCount}/{totalCount} habits completed
        </p>
        {totalCount > 0 && (
          <div className="mt-3 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Today's Habits
          </h2>
          <div className="flex items-center gap-2">
            {habits.length > 1 && (
              <button
                onClick={() => setReorderingHabits((v) => !v)}
                className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${
                  reorderingHabits
                    ? 'bg-gray-700 border-gray-700 text-white dark:bg-gray-200 dark:border-gray-200 dark:text-gray-900'
                    : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                {reorderingHabits ? 'Done' : 'Reorder'}
              </button>
            )}
            <button
              onClick={() => setShowHabitForm(true)}
              className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              <Plus size={14} />
              New Habit
            </button>
          </div>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <HabitCardSkeleton key={i} />)}
          </div>
        ) : habits.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <p className="text-gray-500 dark:text-gray-400 mb-3">No habits yet</p>
            <button
              onClick={() => setShowHabitForm(true)}
              className="text-indigo-600 font-medium text-sm hover:underline"
            >
              Create your first habit →
            </button>
          </div>
        ) : reorderingHabits ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleHabitDragEnd}>
            <SortableContext items={habits.map((h) => h.habitId)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {habits.map((habit) => (
                  <SortableHabitRow
                    key={habit.habitId}
                    habit={habit}
                    completion={completionMap.get(habit.habitId)}
                    onToggle={handleToggle}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="space-y-3">
            {habits.map((habit) => (
              <HabitCard
                key={habit.habitId}
                habit={habit}
                completion={completionMap.get(habit.habitId)}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        {(() => {
          const logCompletedCount = logEntries.length;
          const logTotalCount = logs.length;
          const logProgress = logTotalCount > 0 ? (logCompletedCount / logTotalCount) * 100 : 0;
          return (
            <div className="mb-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Daily Logs</h2>
                <div className="flex items-center gap-2">
                  {logs.length > 1 && (
                    <button
                      onClick={() => setReorderingLogs((v) => !v)}
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${
                        reorderingLogs
                          ? 'bg-gray-700 border-gray-700 text-white dark:bg-gray-200 dark:border-gray-200 dark:text-gray-900'
                          : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      {reorderingLogs ? 'Done' : 'Reorder'}
                    </button>
                  )}
                  <button
                    onClick={() => setShowLogForm(true)}
                    className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                  >
                    <Plus size={14} />
                    New Log
                  </button>
                </div>
              </div>
              {logTotalCount > 0 && (
                <>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {logCompletedCount}/{logTotalCount} logs completed
                  </p>
                  <div className="mt-2 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${logProgress}%` }}
                    />
                  </div>
                </>
              )}
            </div>
          );
        })()}
        {logsLoading || logEntriesLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <HabitCardSkeleton key={i} />)}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <p className="text-gray-500 dark:text-gray-400 mb-2 text-sm">No logs yet</p>
            <button
              onClick={() => setShowLogForm(true)}
              className="text-indigo-600 font-medium text-sm hover:underline"
            >
              Create your first log →
            </button>
          </div>
        ) : reorderingLogs ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleLogDragEnd}>
            <SortableContext items={logs.map((l) => l.logId)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {(() => {
                  const entryMap = new Map(logEntries.map((e) => [e.logId, e]));
                  return logs.map((log) => (
                    <SortableLogRow
                      key={log.logId}
                      log={log}
                      entry={entryMap.get(log.logId)}
                      date={today}
                    />
                  ));
                })()}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="space-y-3">
            {(() => {
              const entryMap = new Map(logEntries.map((e) => [e.logId, e]));
              return logs.map((log) => (
                <LogEntryCard
                  key={log.logId}
                  log={log}
                  entry={entryMap.get(log.logId)}
                  date={today}
                />
              ));
            })()}
          </div>
        )}
      </section>

      {showHabitForm && (
        <HabitForm
          onSave={handleCreateHabit}
          onClose={() => setShowHabitForm(false)}
        />
      )}

      {showLogForm && (
        <LogForm
          onSave={handleCreateLog}
          onClose={() => setShowLogForm(false)}
        />
      )}
    </div>
  );
}
