import { useState, useEffect } from 'react';
import { habitsApi, type Completion } from '../api/habits';
import { subYears, format } from 'date-fns';

export function useHabitHistory(habitId: string) {
  const [history, setHistory] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!habitId) return;
    const today = new Date();
    const yearAgo = subYears(today, 1);
    habitsApi
      .getHistory(habitId, format(yearAgo, 'yyyy-MM-dd'), format(today, 'yyyy-MM-dd'))
      .then(setHistory)
      .catch(() => setError('Failed to load history'))
      .finally(() => setLoading(false));
  }, [habitId]);

  return { history, loading, error };
}
