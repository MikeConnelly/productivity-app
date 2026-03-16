import { useQuery, useQueryClient } from '@tanstack/react-query';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { habitsApi, type Completion } from '../api/habits';
import { queryKeys } from '../lib/queryKeys';

export function useMonthCompletions(year: number, month: number) {
  const queryClient = useQueryClient();
  const monthDate = new Date(year, month, 1);
  const from = format(startOfMonth(monthDate), 'yyyy-MM-dd');
  const to = format(endOfMonth(monthDate), 'yyyy-MM-dd');

  const { data: completions = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.completionsRange(from, to),
    queryFn: () => habitsApi.getCompletionsRange(from, to),
    staleTime: 2 * 60 * 1000,
  });

  const setCompletions = (updater: Completion[] | ((prev: Completion[]) => Completion[])) =>
    queryClient.setQueryData<Completion[]>(queryKeys.completionsRange(from, to), (prev) => {
      if (typeof updater === 'function') return updater(prev ?? []);
      return updater;
    });

  return { completions, setCompletions, loading };
}
