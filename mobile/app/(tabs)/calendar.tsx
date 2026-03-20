import { useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useHabits, useTodayCompletions } from '../../src/hooks/useHabits';
import { useMonthCompletions } from '../../src/hooks/useMonthCompletions';
import { MonthGrid } from '../../src/components/calendar/MonthGrid';
import { useSettings } from '../../src/context/SettingsContext';
import { HabitCard } from '../../src/components/habits/HabitCard';
import { habitsApi } from '../../src/api/habits';
import { queryKeys } from '../../src/lib/queryKeys';
import { useQueryClient } from '@tanstack/react-query';

export default function CalendarScreen() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(
    format(new Date(), 'yyyy-MM-dd')
  );
  const { weekStartsOn } = useSettings();
  const { habits } = useHabits();
  const { completions, loading } = useMonthCompletions(currentMonth);
  const queryClient = useQueryClient();

  // Completions for selected day
  const { completions: dayCompletions, setCompletions: setDayCompletions } = useTodayCompletions(
    selectedDate ?? format(new Date(), 'yyyy-MM-dd')
  );

  const selectedDateCompletions = selectedDate
    ? completions.filter((c) => c.date === selectedDate)
    : [];

  const handleToggle = async (habitId: string, completed: boolean, note?: string) => {
    if (!selectedDate) return;
    if (completed) {
      const optimistic = { habitId, date: selectedDate, completedAt: new Date().toISOString(), note };
      setDayCompletions((prev) => [...prev.filter((c) => c.habitId !== habitId), optimistic]);
      try {
        const result = await habitsApi.complete(habitId, selectedDate, note || undefined);
        queryClient.setQueryData(queryKeys.habits, (prev: typeof habits) =>
          prev.map((h) =>
            h.habitId === habitId
              ? { ...h, currentStreak: result.currentStreak, longestStreak: result.longestStreak }
              : h
          )
        );
        queryClient.invalidateQueries({ queryKey: queryKeys.completionsRange(
          format(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1), 'yyyy-MM-dd'),
          format(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0), 'yyyy-MM-dd')
        )});
      } catch {
        setDayCompletions((prev) => prev.filter((c) => c.habitId !== habitId));
      }
    } else {
      setDayCompletions((prev) => prev.filter((c) => c.habitId !== habitId));
      try {
        await habitsApi.uncomplete(habitId, selectedDate);
        queryClient.invalidateQueries({ queryKey: queryKeys.completionsRange(
          format(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1), 'yyyy-MM-dd'),
          format(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0), 'yyyy-MM-dd')
        )});
      } catch {
        const c = dayCompletions.find((c) => c.habitId === habitId);
        if (c) setDayCompletions((prev) => [...prev, c]);
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Month nav */}
        <View className="flex-row items-center justify-between mb-4">
          <Pressable
            onPress={() => setCurrentMonth((m) => subMonths(m, 1))}
            className="p-2"
            hitSlop={8}
          >
            <ChevronLeft size={22} color="#6366f1" />
          </Pressable>
          <Text className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {format(currentMonth, 'MMMM yyyy')}
          </Text>
          <Pressable
            onPress={() => setCurrentMonth((m) => addMonths(m, 1))}
            className="p-2"
            hitSlop={8}
          >
            <ChevronRight size={22} color="#6366f1" />
          </Pressable>
        </View>

        {/* Grid */}
        {loading ? (
          <ActivityIndicator color="#6366f1" className="my-8" />
        ) : (
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm mb-4">
            <MonthGrid
              month={currentMonth}
              completions={completions}
              totalHabits={habits.length}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              weekStartsOn={weekStartsOn}
            />
          </View>
        )}

        {/* Selected day detail */}
        {selectedDate && (
          <View>
            <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
              {format(new Date(selectedDate + 'T12:00:00'), 'EEEE, MMMM d')}
            </Text>
            {selectedDateCompletions.length === 0 ? (
              <View className="bg-white dark:bg-gray-800 rounded-xl p-4 items-center">
                <Text className="text-gray-400 dark:text-gray-500 text-sm">
                  No completions on this day
                </Text>
              </View>
            ) : (
              habits.map((habit) => {
                const completion = dayCompletions.find((c) => c.habitId === habit.habitId);
                if (!completion && !selectedDateCompletions.find((c) => c.habitId === habit.habitId)) return null;
                return (
                  <HabitCard
                    key={habit.habitId}
                    habit={habit}
                    completion={dayCompletions.find((c) => c.habitId === habit.habitId)}
                    onToggle={handleToggle}
                  />
                );
              })
            )}
          </View>
        )}

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
