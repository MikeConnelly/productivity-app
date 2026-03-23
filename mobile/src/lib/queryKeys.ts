export const queryKeys = {
  habits: ['habits'] as const,
  completions: (date: string) => ['completions', date] as const,
  completionsRange: (from: string, to: string) => ['completions-range', from, to] as const,
  habitHistory: (id: string) => ['habit-history', id] as const,
  logs: ['logs'] as const,
  dayLogEntries: (date: string) => ['day-log-entries', date] as const,
  logEntriesRange: (from: string, to: string) => ['log-entries-range', from, to] as const,
  logHistory: (id: string) => ['log-history', id] as const,
};
