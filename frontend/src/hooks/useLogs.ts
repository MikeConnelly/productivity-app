import { useState, useEffect, useCallback } from 'react';
import { logsApi, type Log, type LogEntry } from '../api/logs';

export function useLogs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await logsApi.list();
      setLogs(data.filter((l) => l.active));
    } catch {
      setError('Failed to load logs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { logs, loading, error, refetch: fetch, setLogs };
}

export function useDayLogEntries(date: string) {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const data = await logsApi.getDayEntries(date);
      setLogEntries(data);
    } catch {
      setLogEntries([]);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { logEntries, loading, setLogEntries, refetch: fetch };
}

export function useLogHistory(logId: string) {
  const [history, setHistory] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!logId) return;
    logsApi
      .getHistory(logId)
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [logId]);

  return { history, loading };
}
