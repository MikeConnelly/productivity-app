export const queryKeys = {
  habits: ['habits'] as const,
  completions: (date: string) => ['completions', date] as const,
  completionsRange: (from: string, to: string) => ['completions-range', from, to] as const,
  habitHistory: (id: string) => ['habit-history', id] as const,
  logs: ['logs'] as const,
  dayLogEntries: (date: string) => ['day-log-entries', date] as const,
  logHistory: (id: string) => ['log-history', id] as const,
  yearHeatmapHabitsRange: (from: string, to: string) => ['year-heatmap-habits-range', from, to] as const,
  yearHeatmapLogsRange: (from: string, to: string) => ['year-heatmap-logs-range', from, to] as const,
};
