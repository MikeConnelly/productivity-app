import { useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useHabits, useTodayCompletions } from '../../src/hooks/useHabits';
import { useMonthCompletions } from '../../src/hooks/useMonthCompletions';
import { MonthGrid } from '../../src/components/calendar/MonthGrid';
import { useSettings } from '../../src/context/SettingsContext';
import { useTheme } from '../../src/context/ThemeContext';
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
  const { isDark } = useTheme();
  const { habits } = useHabits();
  const { completions, loading } = useMonthCompletions(currentMonth);
  const queryClient = useQueryClient();

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
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#111827' : '#f9fafb' }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Month nav */}
        <View style={styles.monthNav}>
          <Pressable
            onPress={() => setCurrentMonth((m) => subMonths(m, 1))}
            style={styles.navButton}
            hitSlop={8}
          >
            <ChevronLeft size={22} color="#6366f1" />
          </Pressable>
          <Text style={[styles.monthTitle, { color: isDark ? '#f3f4f6' : '#111827' }]}>
            {format(currentMonth, 'MMMM yyyy')}
          </Text>
          <Pressable
            onPress={() => setCurrentMonth((m) => addMonths(m, 1))}
            style={styles.navButton}
            hitSlop={8}
          >
            <ChevronRight size={22} color="#6366f1" />
          </Pressable>
        </View>

        {/* Grid */}
        {loading ? (
          <ActivityIndicator color="#6366f1" style={styles.loader} />
        ) : (
          <View style={[styles.gridCard, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}>
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
            <Text style={[styles.dayLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
              {format(new Date(selectedDate + 'T12:00:00'), 'EEEE, MMMM d')}
            </Text>
            {selectedDateCompletions.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}>
                <Text style={[styles.emptyText, { color: isDark ? '#6b7280' : '#9ca3af' }]}>
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

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16 },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  navButton: { padding: 8 },
  monthTitle: { fontSize: 18, fontWeight: '700' },
  loader: { marginVertical: 32 },
  gridCard: { borderRadius: 16, padding: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, marginBottom: 16 },
  dayLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  emptyCard: { borderRadius: 12, padding: 16, alignItems: 'center' },
  emptyText: { fontSize: 14 },
  spacer: { height: 24 },
});
