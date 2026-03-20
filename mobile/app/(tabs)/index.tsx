import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { Plus } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import { habitsApi } from '../../src/api/habits';
import { logsApi } from '../../src/api/logs';
import { useHabits, useTodayCompletions } from '../../src/hooks/useHabits';
import { useLogs, useDayLogEntries } from '../../src/hooks/useLogs';
import { queryKeys } from '../../src/lib/queryKeys';
import { HabitCard } from '../../src/components/habits/HabitCard';
import { HabitForm } from '../../src/components/habits/HabitForm';
import { LogEntryCard } from '../../src/components/logs/LogEntryCard';
import { LogForm } from '../../src/components/logs/LogForm';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { SectionHeader } from '../../src/components/ui/SectionHeader';

const today = format(new Date(), 'yyyy-MM-dd');

export default function TodayScreen() {
  const queryClient = useQueryClient();
  const { habits, loading: habitsLoading } = useHabits();
  const { completions, setCompletions } = useTodayCompletions(today);
  const { logs, loading: logsLoading } = useLogs();
  const { entries } = useDayLogEntries(today);

  const [showHabitForm, setShowHabitForm] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const completedCount = habits.filter((h) =>
    completions.some((c) => c.habitId === h.habitId)
  ).length;

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setRefreshing(false);
  };

  const handleToggle = async (habitId: string, completed: boolean, note?: string) => {
    const habit = habits.find((h) => h.habitId === habitId);
    if (!habit) return;

    if (completed) {
      // Optimistic
      const optimistic = { habitId, date: today, completedAt: new Date().toISOString(), note };
      setCompletions((prev) => [...prev.filter((c) => c.habitId !== habitId), optimistic]);
      try {
        const result = await habitsApi.complete(habitId, today, note || undefined);
        // Update streak in habits cache
        queryClient.setQueryData(queryKeys.habits, (prev: typeof habits) =>
          prev.map((h) =>
            h.habitId === habitId
              ? { ...h, currentStreak: result.currentStreak, longestStreak: result.longestStreak }
              : h
          )
        );
      } catch {
        setCompletions((prev) => prev.filter((c) => c.habitId !== habitId));
      }
    } else {
      setCompletions((prev) => prev.filter((c) => c.habitId !== habitId));
      try {
        await habitsApi.uncomplete(habitId, today);
      } catch {
        const completion = completions.find((c) => c.habitId === habitId);
        if (completion) setCompletions((prev) => [...prev, completion]);
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View className="mb-5">
          <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {format(new Date(), 'EEEE, MMMM d')}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {completedCount} of {habits.length} habits done
          </Text>
          <View className="mt-3">
            <ProgressBar value={habits.length > 0 ? completedCount / habits.length : 0} />
          </View>
        </View>

        {/* Habits */}
        <SectionHeader
          title="Habits"
          actionLabel="Add"
          onAction={() => setShowHabitForm(true)}
        />
        {habitsLoading ? (
          <ActivityIndicator color="#6366f1" className="my-4" />
        ) : habits.length === 0 ? (
          <Pressable
            onPress={() => setShowHabitForm(true)}
            className="items-center py-8 bg-white dark:bg-gray-800 rounded-xl mb-4"
          >
            <Text className="text-gray-400 dark:text-gray-500 mb-1">No habits yet</Text>
            <Text className="text-indigo-500 text-sm font-medium">+ Add your first habit</Text>
          </Pressable>
        ) : (
          habits.map((habit) => (
            <HabitCard
              key={habit.habitId}
              habit={habit}
              completion={completions.find((c) => c.habitId === habit.habitId)}
              onToggle={handleToggle}
            />
          ))
        )}

        {/* Logs */}
        <View className="mt-4">
          <SectionHeader
            title="Logs"
            actionLabel="Add"
            onAction={() => setShowLogForm(true)}
          />
          {logsLoading ? (
            <ActivityIndicator color="#6366f1" className="my-4" />
          ) : logs.length === 0 ? (
            <Pressable
              onPress={() => setShowLogForm(true)}
              className="items-center py-8 bg-white dark:bg-gray-800 rounded-xl"
            >
              <Text className="text-gray-400 dark:text-gray-500 mb-1">No logs yet</Text>
              <Text className="text-indigo-500 text-sm font-medium">+ Add your first log</Text>
            </Pressable>
          ) : (
            logs.map((log) => (
              <LogEntryCard
                key={log.logId}
                log={log}
                entry={entries.find((e) => e.logId === log.logId)}
                date={today}
              />
            ))
          )}
        </View>

        <View className="h-6" />
      </ScrollView>

      {showHabitForm && (
        <HabitForm
          onSave={async (data) => {
            const newHabit = await habitsApi.create(data);
            queryClient.setQueryData(queryKeys.habits, (prev: typeof habits) => [
              ...(prev ?? []),
              newHabit,
            ]);
          }}
          onClose={() => setShowHabitForm(false)}
        />
      )}

      {showLogForm && (
        <LogForm
          onSave={async (data) => {
            const newLog = await logsApi.create(data);
            queryClient.setQueryData(queryKeys.logs, (prev: typeof logs) => [
              ...(prev ?? []),
              newLog,
            ]);
          }}
          onClose={() => setShowLogForm(false)}
        />
      )}
    </SafeAreaView>
  );
}
