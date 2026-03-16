import { useQuery } from '@tanstack/react-query';
import { habitsApi } from '../api/habits';
import { subYears, format } from 'date-fns';
import { queryKeys } from '../lib/queryKeys';

export function useHabitHistory(habitId: string) {
  const { data: history = [], isLoading: loading, error } = useQuery({
    queryKey: queryKeys.habitHistory(habitId),
    queryFn: () => {
      const today = new Date();
      const yearAgo = subYears(today, 1);
      return habitsApi.getHistory(habitId, format(yearAgo, 'yyyy-MM-dd'), format(today, 'yyyy-MM-dd'));
    },
    staleTime: 10 * 60 * 1000,
    enabled: !!habitId,
  });

  return { history, loading, error: error ? 'Failed to load history' : null };
}
