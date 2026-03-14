import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, Activity } from 'lucide-react';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  format,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns';
import { useHabits } from '../hooks/useHabits';
import { useLogs } from '../hooks/useLogs';
import { useMonthCompletions } from '../hooks/useMonthCompletions';
import { useYearHeatmap, type HeatmapMode } from '../hooks/useYearHeatmap';
import { DayCell } from '../components/calendar/DayCell';
import { DayDetail } from '../components/calendar/DayDetail';
import { ActivityHeatmap } from '../components/habits/ActivityHeatmap';

type ViewMode = 'calendar' | 'heatmap';

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const CATEGORY_TABS: { key: HeatmapMode; label: string }[] = [
  { key: 'habits', label: 'Habits' },
  { key: 'logs', label: 'Logs' },
  { key: 'journal', label: 'Journal' },
];

export function CalendarPage() {
  const [view, setView] = useState<ViewMode>('calendar');
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [mode, setMode] = useState<HeatmapMode>('habits');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const { habits } = useHabits();
  const { logs } = useLogs();
  const { completions, loading: calendarLoading } = useMonthCompletions(year, month);
  const { data: heatmapData, loading: heatmapLoading } = useYearHeatmap(
    mode, selectedId, habits.length, logs.length,
  );

  const heatmapColor = useMemo(() => {
    if (mode === 'habits' && selectedId)
      return habits.find((h) => h.habitId === selectedId)?.color ?? '#6366f1';
    if (mode === 'logs' && selectedId)
      return logs.find((l) => l.logId === selectedId)?.color ?? '#6366f1';
    return '#6366f1';
  }, [mode, selectedId, habits, logs]);

  const dayLevelMap = useMemo(() => {
    const map = new Map<string, 0 | 1 | 2 | 3 | 4>();
    for (const d of heatmapData) map.set(d.date, d.level as 0 | 1 | 2 | 3 | 4);
    return map;
  }, [heatmapData]);

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const firstDayOffset = (getDay(days[0]) + 6) % 7;

  const selectedCompletions = selectedDate
    ? completions.filter((c) => c.date === selectedDate)
    : [];

  function handleModeChange(newMode: HeatmapMode) {
    setMode(newMode);
    setSelectedId(null);
  }

  function handleViewChange(newView: ViewMode) {
    setView(newView);
    if (newView === 'heatmap') setSelectedDate(null);
  }

  const filterItems = mode === 'habits' ? habits : mode === 'logs' ? logs : [];

  const filterPanel = (
    <div className="space-y-5">
      {/* View toggle */}
      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">View</p>
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <button
            onClick={() => handleViewChange('calendar')}
            className={`flex items-center gap-1.5 flex-1 justify-center px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
              view === 'calendar'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <CalendarDays size={14} />
            Calendar
          </button>
          <button
            onClick={() => handleViewChange('heatmap')}
            className={`flex items-center gap-1.5 flex-1 justify-center px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
              view === 'heatmap'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <Activity size={14} />
            Heatmap
          </button>
        </div>
      </div>

      {/* Category */}
      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Category</p>
        <div className="flex flex-col gap-0.5">
          {CATEGORY_TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleModeChange(key)}
              className={`px-3 py-1.5 text-sm rounded-md font-medium text-left transition-colors ${
                mode === key
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Item filter (Habits / Logs only) */}
      {mode !== 'journal' && filterItems.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            {mode === 'habits' ? 'Habit' : 'Log'}
          </p>
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => setSelectedId(null)}
              className={`px-3 py-1.5 text-sm rounded-md font-medium text-left transition-colors ${
                selectedId === null
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              All
            </button>
            {filterItems.map((item) => {
              const id = mode === 'habits'
                ? (item as typeof habits[0]).habitId
                : (item as typeof logs[0]).logId;
              return (
                <button
                  key={id}
                  onClick={() => setSelectedId(id)}
                  className={`px-3 py-1.5 text-sm rounded-md font-medium text-left transition-colors flex items-center gap-2 ${
                    selectedId === id
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex gap-6 items-start">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {view === 'calendar' ? (
            <>
              {/* Month navigation */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => { setCurrentMonth((m) => subMonths(m, 1)); setSelectedDate(null); }}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <button
                  onClick={() => { setCurrentMonth((m) => addMonths(m, 1)); setSelectedDate(null); }}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {DAY_HEADERS.map((d) => (
                  <div key={d} className="text-center text-xs font-semibold text-gray-400 dark:text-gray-500 py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              {calendarLoading || heatmapLoading ? (
                <div className="text-center py-12 text-gray-400 dark:text-gray-500">Loading...</div>
              ) : (
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDayOffset }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {days.map((day) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    return (
                      <DayCell
                        key={dateStr}
                        date={dateStr}
                        level={dayLevelMap.get(dateStr) ?? 0}
                        color={heatmapColor}
                        isSelected={selectedDate === dateStr}
                        isToday={isToday(day)}
                        onClick={() => setSelectedDate(selectedDate === dateStr ? null : dateStr)}
                      />
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <ActivityHeatmap data={heatmapData} color={heatmapColor} loading={heatmapLoading} />
          )}

          {/* Mobile: filter panel or day detail (day detail takes over when a date is selected) */}
          <div className="md:hidden mt-6">
            {selectedDate ? (
              <DayDetail
                date={selectedDate}
                habits={habits}
                completions={selectedCompletions}
                logs={logs}
              />
            ) : (
              filterPanel
            )}
          </div>
        </div>

        {/* Desktop right column: filter panel + day detail */}
        <div className="hidden md:flex flex-col gap-5 w-72 shrink-0">
          {filterPanel}
          {selectedDate && (
            <DayDetail
              date={selectedDate}
              habits={habits}
              completions={selectedCompletions}
              logs={logs}
            />
          )}
        </div>
      </div>
    </div>
  );
}
