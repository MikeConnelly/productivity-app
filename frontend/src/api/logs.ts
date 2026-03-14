import apiClient from './client';

export interface Log {
  logId: string;
  name: string;
  color: string;
  icon: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LogEntry {
  logId: string;
  date: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export const logsApi = {
  list: () => apiClient.get<Log[]>('/logs').then((r) => r.data),

  create: (data: { name: string; color: string; icon: string }) =>
    apiClient.post<Log>('/logs', data).then((r) => r.data),

  update: (logId: string, data: Partial<Pick<Log, 'name' | 'color' | 'icon' | 'active'>>) =>
    apiClient.put<Log>(`/logs/${logId}`, data).then((r) => r.data),

  delete: (logId: string) => apiClient.delete(`/logs/${logId}`),

  upsertEntry: (logId: string, date: string, content: string) =>
    apiClient.put<LogEntry>(`/logs/${logId}/entries/${date}`, { content }).then((r) => r.data),

  getEntry: (logId: string, date: string) =>
    apiClient.get<LogEntry>(`/logs/${logId}/entries/${date}`).then((r) => r.data),

  deleteEntry: (logId: string, date: string) =>
    apiClient.delete(`/logs/${logId}/entries/${date}`),

  getHistory: (logId: string, from?: string, to?: string) => {
    const params = from && to ? { from, to } : {};
    return apiClient.get<LogEntry[]>(`/logs/${logId}/entries`, { params }).then((r) => r.data);
  },

  getDayEntries: (date: string) =>
    apiClient.get<LogEntry[]>('/log-entries', { params: { date } }).then((r) => r.data),

  getEntriesRange: (from: string, to: string) =>
    apiClient.get<LogEntry[]>('/log-entries/range', { params: { from, to } }).then((r) => r.data),
};
