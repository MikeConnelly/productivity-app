import apiClient from './client';

export interface Habit {
  habitId: string;
  name: string;
  color: string;
  icon: string;
  active: boolean;
  currentStreak: number;
  longestStreak: number;
  createdAt: string;
  updatedAt: string;
}

export interface Completion {
  habitId: string;
  date: string;
  completedAt: string;
  note?: string;
}

export const habitsApi = {
  list: () => apiClient.get<Habit[]>('/habits').then((r) => r.data),

  create: (data: { name: string; color: string; icon: string }) =>
    apiClient.post<Habit>('/habits', data).then((r) => r.data),

  update: (habitId: string, data: Partial<Pick<Habit, 'name' | 'color' | 'icon' | 'active'>>) =>
    apiClient.put<Habit>(`/habits/${habitId}`, data).then((r) => r.data),

  delete: (habitId: string) => apiClient.delete(`/habits/${habitId}`),

  complete: (habitId: string, date: string, note?: string) =>
    apiClient.post<Completion & { currentStreak: number; longestStreak: number }>(
      `/habits/${habitId}/completions`,
      { date, note }
    ).then((r) => r.data),

  uncomplete: (habitId: string, date: string) =>
    apiClient.delete(`/habits/${habitId}/completions/${date}`),

  getHistory: (habitId: string, from?: string, to?: string) => {
    const params = from && to ? { from, to } : {};
    return apiClient.get<Completion[]>(`/habits/${habitId}/history`, { params }).then((r) => r.data);
  },

  getDayCompletions: (date: string) =>
    apiClient.get<Completion[]>('/completions', { params: { date } }).then((r) => r.data),

  getCompletionsRange: (from: string, to: string) =>
    apiClient.get<Completion[]>('/completions/range', { params: { from, to } }).then((r) => r.data),
};
