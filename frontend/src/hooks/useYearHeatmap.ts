import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { subYears, format } from 'date-fns';
import { habitsApi } from '../api/habits';
import { logsApi } from '../api/logs';
import { journalApi } from '../api/journal';
import { queryKeys } from '../lib/queryKeys';

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
  // Stable date references — computed once on mount
  const today = useMemo(() => new Date(), []);
  const yearAgo = useMemo(() => subYears(today, 1), [today]);
  const from = useMemo(() => format(yearAgo, 'yyyy-MM-dd'), [yearAgo]);
  const to = useMemo(() => format(today, 'yyyy-MM-dd'), [today]);

  const habitsRangeQuery = useQuery({
    queryKey: queryKeys.yearHeatmapHabitsRange(from, to),
    queryFn: () => habitsApi.getCompletionsRange(from, to),
    enabled: mode === 'habits',
    staleTime: 5 * 60 * 1000,
  });

  const logsRangeQuery = useQuery({
    queryKey: queryKeys.yearHeatmapLogsRange(from, to),
    queryFn: () => logsApi.getEntriesRange(from, to),
    enabled: mode === 'logs',
    staleTime: 5 * 60 * 1000,
  });

  const journalQuery = useQuery({
    queryKey: queryKeys.journalEntries,
    queryFn: () => journalApi.list(),
    enabled: mode === 'journal',
    staleTime: 5 * 60 * 1000,
  });

  const data = useMemo<CalendarDay[]>(() => {
    if (mode === 'habits') {
      const completions = habitsRangeQuery.data ?? [];
      const filtered = selectedId ? completions.filter((c) => c.habitId === selectedId) : completions;
      if (selectedId) {
        const dateMap = new Map<string, number>();
        for (const c of filtered) dateMap.set(c.date, 1);
        return buildDayArray(dateMap, yearAgo, today, (count) => (count > 0 ? 4 : 0));
      } else {
        const dayHabits = new Map<string, Set<string>>();
        for (const c of filtered) {
          if (!dayHabits.has(c.date)) dayHabits.set(c.date, new Set());
          dayHabits.get(c.date)!.add(c.habitId);
        }
        const dateMap = new Map<string, number>();
        for (const [date, ids] of dayHabits) dateMap.set(date, ids.size);
        return buildDayArray(dateMap, yearAgo, today, (count) =>
          totalHabits === 0 ? 0 : ratioToLevel(count / totalHabits)
        );
      }
    } else if (mode === 'logs') {
      const entries = logsRangeQuery.data ?? [];
      const filtered = selectedId ? entries.filter((e) => e.logId === selectedId) : entries;
      if (selectedId) {
        const dateMap = new Map<string, number>();
        for (const e of filtered) dateMap.set(e.date, 1);
        return buildDayArray(dateMap, yearAgo, today, (count) => (count > 0 ? 4 : 0));
      } else {
        const dayLogs = new Map<string, Set<string>>();
        for (const e of filtered) {
          if (!dayLogs.has(e.date)) dayLogs.set(e.date, new Set());
          dayLogs.get(e.date)!.add(e.logId);
        }
        const dateMap = new Map<string, number>();
        for (const [date, ids] of dayLogs) dateMap.set(date, ids.size);
        return buildDayArray(dateMap, yearAgo, today, (count) =>
          totalLogs === 0 ? 0 : ratioToLevel(count / totalLogs)
        );
      }
    } else {
      // journal
      const entries = journalQuery.data ?? [];
      const dateMap = new Map<string, number>();
      for (const e of entries) dateMap.set(e.date, 1);
      return buildDayArray(dateMap, yearAgo, today, (count) => (count > 0 ? 4 : 0));
    }
  }, [mode, selectedId, totalHabits, totalLogs, habitsRangeQuery.data, logsRangeQuery.data, journalQuery.data, yearAgo, today]);

  const loading =
    (mode === 'habits' && habitsRangeQuery.isLoading) ||
    (mode === 'logs' && logsRangeQuery.isLoading) ||
    (mode === 'journal' && journalQuery.isLoading);

  return { data, loading };
}
