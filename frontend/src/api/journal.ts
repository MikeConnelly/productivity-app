import apiClient from './client';

export interface JournalEntry {
  date: string;
  content: string;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
}

export const journalApi = {
  list: () => apiClient.get<JournalEntry[]>('/journal').then((r) => r.data),

  get: (date: string) =>
    apiClient.get<JournalEntry>(`/journal/${date}`).then((r) => r.data),

  upsert: (date: string, content: string) =>
    apiClient.put<JournalEntry>(`/journal/${date}`, { content }).then((r) => r.data),

  delete: (date: string) => apiClient.delete(`/journal/${date}`),
};
