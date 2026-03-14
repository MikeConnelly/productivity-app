import { useState, useEffect, useCallback } from 'react';
import { subYears, format } from 'date-fns';
import { habitsApi } from '../api/habits';
import { logsApi } from '../api/logs';
import { journalApi } from '../api/journal';

export type HeatmapMode = 'habits' | 'logs' | 'journal';

export interface CalendarDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

function ratioToLevel(ratio: number): 0 | 1 | 2 | 3 | 4 {
  if (ratio <= 0) return 0;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

function buildDayArray(
  dateMap: Map<string, number>,
  from: Date,
  to: Date,
  getLevel: (count: number, dateStr: string) => 0 | 1 | 2 | 3 | 4,
): CalendarDay[] {
  const data: CalendarDay[] = [];
  const current = new Date(from);
  while (current <= to) {
    const dateStr = format(current, 'yyyy-MM-dd');
    const count = dateMap.get(dateStr) ?? 0;
    data.push({ date: dateStr, count, level: getLevel(count, dateStr) });
    current.setDate(current.getDate() + 1);
  }
  return data;
}

export function useYearHeatmap(
  mode: HeatmapMode,
  selectedId: string | null,
  totalHabits: number,
  totalLogs: number,
): { data: CalendarDay[]; loading: boolean } {
  const [data, setData] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const today = new Date();
      const yearAgo = subYears(today, 1);
      const from = format(yearAgo, 'yyyy-MM-dd');
      const to = format(today, 'yyyy-MM-dd');

      if (mode === 'habits') {
        if (selectedId) {
          const history = await habitsApi.getHistory(selectedId, from, to);
          const dateMap = new Map<string, number>();
          for (const c of history) dateMap.set(c.date, (dateMap.get(c.date) ?? 0) + 1);
          setData(buildDayArray(dateMap, yearAgo, today, (count) => (count > 0 ? 4 : 0)));
        } else {
          const completions = await habitsApi.getCompletionsRange(from, to);
          // count unique habits per day
          const dayHabits = new Map<string, Set<string>>();
          for (const c of completions) {
            if (!dayHabits.has(c.date)) dayHabits.set(c.date, new Set());
            dayHabits.get(c.date)!.add(c.habitId);
          }
          const dateMap = new Map<string, number>();
          for (const [date, ids] of dayHabits) dateMap.set(date, ids.size);
          const total = totalHabits;
          setData(buildDayArray(dateMap, yearAgo, today, (count) =>
            total === 0 ? 0 : ratioToLevel(count / total)
          ));
        }
      } else if (mode === 'logs') {
        if (selectedId) {
          const history = await logsApi.getHistory(selectedId, from, to);
          const dateMap = new Map<string, number>();
          for (const e of history) dateMap.set(e.date, (dateMap.get(e.date) ?? 0) + 1);
          setData(buildDayArray(dateMap, yearAgo, today, (count) => (count > 0 ? 4 : 0)));
        } else {
          const entries = await logsApi.getEntriesRange(from, to);
          // count unique logs per day
          const dayLogs = new Map<string, Set<string>>();
          for (const e of entries) {
            if (!dayLogs.has(e.date)) dayLogs.set(e.date, new Set());
            dayLogs.get(e.date)!.add(e.logId);
          }
          const dateMap = new Map<string, number>();
          for (const [date, ids] of dayLogs) dateMap.set(date, ids.size);
          const total = totalLogs;
          setData(buildDayArray(dateMap, yearAgo, today, (count) =>
            total === 0 ? 0 : ratioToLevel(count / total)
          ));
        }
      } else {
        // journal
        const entries = await journalApi.list();
        const dateMap = new Map<string, number>();
        for (const e of entries) dateMap.set(e.date, 1);
        setData(buildDayArray(dateMap, yearAgo, today, (count) => (count > 0 ? 4 : 0)));
      }
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [mode, selectedId, totalHabits, totalLogs]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading };
}
