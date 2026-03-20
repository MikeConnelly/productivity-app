import { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { format } from 'date-fns';
import { ChevronLeft, Edit2 } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useHabits } from '../../src/hooks/useHabits';
import { useHabitHistory } from '../../src/hooks/useHabitHistory';
import { habitsApi } from '../../src/api/habits';
import { queryKeys } from '../../src/lib/queryKeys';
import { StreakBadge } from '../../src/components/habits/StreakBadge';
import { HabitForm } from '../../src/components/habits/HabitForm';

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { habits } = useHabits();
  const { completions, loading } = useHabitHistory(id);
  const [showEdit, setShowEdit] = useState(false);

  const habit = habits.find((h) => h.habitId === id);

  if (!habit) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <ActivityIndicator color="#6366f1" />
      </SafeAreaView>
    );
  }

  const recent = [...completions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20);

  const handleDelete = async () => {
    await habitsApi.delete(habit.habitId);
    queryClient.setQueryData(queryKeys.habits, (prev: typeof habits) =>
      prev.filter((h) => h.habitId !== habit.habitId)
    );
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Back */}
        <Pressable onPress={() => router.back()} className="flex-row items-center mb-4" hitSlop={8}>
          <ChevronLeft size={20} color="#6366f1" />
          <Text className="text-indigo-500 font-medium ml-1">Today</Text>
        </Pressable>

        {/* Header card */}
        <View
          className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm mb-4"
          style={{ borderLeftWidth: 4, borderLeftColor: habit.color }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <Text style={{ fontSize: 32 }}>{habit.icon}</Text>
              <Text className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {habit.name}
              </Text>
            </View>
            <Pressable
              onPress={() => setShowEdit(true)}
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
              hitSlop={8}
            >
              <Edit2 size={18} color="#6366f1" />
            </Pressable>
          </View>

          <View className="mt-4">
            <StreakBadge
              currentStreak={habit.currentStreak}
              longestStreak={habit.longestStreak}
            />
          </View>
        </View>

        {/* Recent completions */}
        <Text className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
          Recent Completions
        </Text>
        {loading ? (
          <ActivityIndicator color="#6366f1" className="my-4" />
        ) : recent.length === 0 ? (
          <View className="bg-white dark:bg-gray-800 rounded-xl p-4 items-center">
            <Text className="text-gray-400 dark:text-gray-500 text-sm">No completions yet</Text>
          </View>
        ) : (
          recent.map((c) => (
            <View
              key={c.date}
              className="flex-row items-center bg-white dark:bg-gray-800 rounded-xl px-4 py-3 mb-2 shadow-sm"
            >
              <View
                className="w-2 h-2 rounded-full mr-3"
                style={{ backgroundColor: habit.color }}
              />
              <Text className="flex-1 text-gray-900 dark:text-gray-100">
                {format(new Date(c.date + 'T12:00:00'), 'EEE, MMM d')}
              </Text>
              {c.note && (
                <Text className="text-xs text-gray-400 dark:text-gray-500 max-w-[140px]" numberOfLines={1}>
                  "{c.note}"
                </Text>
              )}
            </View>
          ))
        )}

        <View className="h-6" />
      </ScrollView>

      {showEdit && (
        <HabitForm
          initial={habit}
          onSave={async (data) => {
            const updated = await habitsApi.update(habit.habitId, data);
            queryClient.setQueryData(queryKeys.habits, (prev: typeof habits) =>
              prev.map((h) => (h.habitId === habit.habitId ? { ...h, ...updated } : h))
            );
          }}
          onDelete={handleDelete}
          onClose={() => setShowEdit(false)}
        />
      )}
    </SafeAreaView>
  );
}
