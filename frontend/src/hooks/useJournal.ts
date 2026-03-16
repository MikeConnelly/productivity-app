import { useQuery, useQueryClient } from '@tanstack/react-query';
import { journalApi, type JournalEntry } from '../api/journal';
import { queryKeys } from '../lib/queryKeys';

export function useJournalEntries() {
  const { data: entries = [], isLoading: loading, error } = useQuery({
    queryKey: queryKeys.journalEntries,
    queryFn: () => journalApi.list(),
    staleTime: 5 * 60 * 1000,
  });

  return { entries, loading, error: error ? 'Failed to load journal entries' : null };
}

export function useJournalEntry(date: string) {
  const queryClient = useQueryClient();
  const { data: entry = null, isLoading: loading } = useQuery({
    queryKey: queryKeys.journalEntry(date),
    queryFn: () => journalApi.get(date),
    staleTime: 2 * 60 * 1000,
    enabled: !!date,
  });

  const setEntry = (updater: JournalEntry | null | ((prev: JournalEntry | null) => JournalEntry | null)) =>
    queryClient.setQueryData<JournalEntry | null>(queryKeys.journalEntry(date), (prev) => {
      if (typeof updater === 'function') return updater(prev ?? null);
      return updater;
    });

  return { entry, loading, setEntry };
}
