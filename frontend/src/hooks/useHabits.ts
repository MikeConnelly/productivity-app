import { useState, useEffect, useCallback } from 'react';
import { habitsApi, type Habit, type Completion } from '../api/habits';

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await habitsApi.list();
      setHabits(data.filter((h) => h.active));
    } catch {
      setError('Failed to load habits');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { habits, loading, error, refetch: fetch, setHabits };
}

export function useTodayCompletions(date: string) {
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const data = await habitsApi.getDayCompletions(date);
      setCompletions(data);
    } catch {
      setCompletions([]);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { completions, loading, setCompletions, refetch: fetch };
}
