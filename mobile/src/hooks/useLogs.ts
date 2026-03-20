import { useQuery, useQueryClient } from '@tanstack/react-query';
import { logsApi, type Log, type LogEntry } from '../api/logs';
import { queryKeys } from '../lib/queryKeys';

export function useLogs() {
  const queryClient = useQueryClient();
  const { data: logs = [], isLoading: loading, error } = useQuery({
    queryKey: queryKeys.logs,
    queryFn: () => logsApi.list().then((d) => d.filter((l) => l.active)),
    staleTime: 5 * 60 * 1000,
  });

  const setLogs = (updater: Log[] | ((prev: Log[]) => Log[])) =>
    queryClient.setQueryData<Log[]>(queryKeys.logs, (prev) => {
      if (typeof updater === 'function') return updater(prev ?? []);
      return updater;
    });

  return { logs, loading, error: error ? 'Failed to load logs' : null, setLogs };
}

export function useDayLogEntries(date: string) {
  const queryClient = useQueryClient();
  const { data: entries = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.dayLogEntries(date),
    queryFn: () => logsApi.getDayEntries(date),
    staleTime: 1 * 60 * 1000,
  });

  const setEntries = (updater: LogEntry[] | ((prev: LogEntry[]) => LogEntry[])) =>
    queryClient.setQueryData<LogEntry[]>(queryKeys.dayLogEntries(date), (prev) => {
      if (typeof updater === 'function') return updater(prev ?? []);
      return updater;
    });

  return { entries, loading, setEntries };
}
