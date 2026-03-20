import { useQuery } from '@tanstack/react-query';
import { habitsApi } from '../api/habits';
import { queryKeys } from '../lib/queryKeys';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export function useMonthCompletions(date: Date) {
  const from = format(startOfMonth(date), 'yyyy-MM-dd');
  const to = format(endOfMonth(date), 'yyyy-MM-dd');

  const { data: completions = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.completionsRange(from, to),
    queryFn: () => habitsApi.getCompletionsRange(from, to),
    staleTime: 2 * 60 * 1000,
  });

  return { completions, loading, from, to };
}
