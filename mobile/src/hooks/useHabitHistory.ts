import { useQuery } from '@tanstack/react-query';
import { habitsApi } from '../api/habits';
import { queryKeys } from '../lib/queryKeys';

export function useHabitHistory(habitId: string) {
  const { data: completions = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.habitHistory(habitId),
    queryFn: () => habitsApi.getHistory(habitId),
    staleTime: 2 * 60 * 1000,
    enabled: !!habitId,
  });

  return { completions, loading };
}
