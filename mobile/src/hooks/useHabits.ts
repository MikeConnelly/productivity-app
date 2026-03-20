import { useQuery, useQueryClient } from '@tanstack/react-query';
import { habitsApi, type Habit, type Completion } from '../api/habits';
import { queryKeys } from '../lib/queryKeys';

export function useHabits() {
  const queryClient = useQueryClient();
  const { data: habits = [], isLoading: loading, error } = useQuery({
    queryKey: queryKeys.habits,
    queryFn: () => habitsApi.list().then((d) => d.filter((h) => h.active)),
    staleTime: 5 * 60 * 1000,
  });

  const setHabits = (updater: Habit[] | ((prev: Habit[]) => Habit[])) =>
    queryClient.setQueryData<Habit[]>(queryKeys.habits, (prev) => {
      if (typeof updater === 'function') return updater(prev ?? []);
      return updater;
    });

  return { habits, loading, error: error ? 'Failed to load habits' : null, setHabits };
}

export function useTodayCompletions(date: string) {
  const queryClient = useQueryClient();
  const { data: completions = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.completions(date),
    queryFn: () => habitsApi.getDayCompletions(date),
    staleTime: 1 * 60 * 1000,
  });

  const setCompletions = (updater: Completion[] | ((prev: Completion[]) => Completion[])) =>
    queryClient.setQueryData<Completion[]>(queryKeys.completions(date), (prev) => {
      if (typeof updater === 'function') return updater(prev ?? []);
      return updater;
    });

  return { completions, loading, setCompletions };
}
