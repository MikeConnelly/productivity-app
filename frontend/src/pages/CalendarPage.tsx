import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
import { DayCell } from '../components/calendar/DayCell';
import { DayDetail } from '../components/calendar/DayDetail';

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const { habits } = useHabits();
  const { logs } = useLogs();
  const { completions, loading } = useMonthCompletions(year, month);

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });

  const firstDayOffset = (getDay(days[0]) + 6) % 7;

  const completionsByDate = completions.reduce<Record<string, number>>((acc, c) => {
    acc[c.date] = (acc[c.date] ?? 0) + 1;
    return acc;
  }, {});

  const selectedCompletions = selectedDate
    ? completions.filter((c) => c.date === selectedDate)
    : [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex gap-6 items-start">
        {/* Calendar column */}
        <div className="flex-1 min-w-0">
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
          {loading ? (
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
                    completionCount={completionsByDate[dateStr] ?? 0}
                    totalHabits={habits.length}
                    isSelected={selectedDate === dateStr}
                    isToday={isToday(day)}
                    onClick={() => setSelectedDate(selectedDate === dateStr ? null : dateStr)}
                  />
                );
              })}
            </div>
          )}

          {/* Detail panel — below calendar on mobile only */}
          {selectedDate && (
            <div className="md:hidden mt-4">
              <DayDetail
                date={selectedDate}
                habits={habits}
                completions={selectedCompletions}
                logs={logs}
              />
            </div>
          )}
        </div>

        {/* Detail panel — side panel on desktop */}
        <div
          className={`hidden md:block w-72 shrink-0 transition-all duration-300 ease-out ${
            selectedDate
              ? 'opacity-100 translate-x-0'
              : 'opacity-0 translate-x-8 pointer-events-none'
          }`}
        >
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
