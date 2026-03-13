import { useState, useEffect, useCallback } from 'react';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { habitsApi, type Completion } from '../api/habits';

export function useMonthCompletions(year: number, month: number) {
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const monthDate = new Date(year, month, 1);
      const from = format(startOfMonth(monthDate), 'yyyy-MM-dd');
      const to = format(endOfMonth(monthDate), 'yyyy-MM-dd');
      const data = await habitsApi.getCompletionsRange(from, to);
      setCompletions(data);
    } catch {
      setCompletions([]);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { completions, loading, refetch: fetch };
}
