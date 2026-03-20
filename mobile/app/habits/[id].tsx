import { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, StyleSheet } from 'react-native';
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
import { useTheme } from '../../src/context/ThemeContext';

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isDark } = useTheme();
  const { habits } = useHabits();
  const { completions, loading } = useHabitHistory(id);
  const [showEdit, setShowEdit] = useState(false);

  const habit = habits.find((h) => h.habitId === id);

  if (!habit) {
    return (
      <SafeAreaView style={[styles.container, styles.centered, { backgroundColor: isDark ? '#111827' : '#f9fafb' }]}>
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
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#111827' : '#f9fafb' }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Back */}
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
          <ChevronLeft size={20} color="#6366f1" />
          <Text style={styles.backText}>Today</Text>
        </Pressable>

        {/* Header card */}
        <View
          style={[styles.headerCard, { backgroundColor: isDark ? '#1f2937' : '#fff', borderLeftColor: habit.color }]}
        >
          <View style={styles.headerRow}>
            <View style={styles.habitTitle}>
              <Text style={styles.habitIcon}>{habit.icon}</Text>
              <Text style={[styles.habitName, { color: isDark ? '#f3f4f6' : '#111827' }]}>
                {habit.name}
              </Text>
            </View>
            <Pressable
              onPress={() => setShowEdit(true)}
              style={[styles.editButton, { backgroundColor: isDark ? '#374151' : '#f3f4f6' }]}
              hitSlop={8}
            >
              <Edit2 size={18} color="#6366f1" />
            </Pressable>
          </View>

          <View style={styles.streakContainer}>
            <StreakBadge
              currentStreak={habit.currentStreak}
              longestStreak={habit.longestStreak}
            />
          </View>
        </View>

        {/* Recent completions */}
        <Text style={[styles.sectionLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
          Recent Completions
        </Text>
        {loading ? (
          <ActivityIndicator color="#6366f1" style={styles.loader} />
        ) : recent.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}>
            <Text style={[styles.emptyText, { color: isDark ? '#6b7280' : '#9ca3af' }]}>No completions yet</Text>
          </View>
        ) : (
          recent.map((c) => (
            <View
              key={c.date}
              style={[styles.completionRow, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}
            >
              <View style={[styles.dot, { backgroundColor: habit.color }]} />
              <Text style={[styles.completionDate, { color: isDark ? '#f3f4f6' : '#111827' }]}>
                {format(new Date(c.date + 'T12:00:00'), 'EEE, MMM d')}
              </Text>
              {c.note && (
                <Text style={[styles.completionNote, { color: isDark ? '#6b7280' : '#9ca3af' }]} numberOfLines={1}>
                  "{c.note}"
                </Text>
              )}
            </View>
          ))
        )}

        <View style={styles.spacer} />
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: 16 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backText: { color: '#6366f1', fontWeight: '500', marginLeft: 4 },
  headerCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  habitTitle: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  habitIcon: { fontSize: 32 },
  habitName: { fontSize: 20, fontWeight: '700' },
  editButton: { padding: 8, borderRadius: 8 },
  streakContainer: { marginTop: 16 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  loader: { marginVertical: 16 },
  emptyCard: { borderRadius: 12, padding: 16, alignItems: 'center' },
  emptyText: { fontSize: 14 },
  completionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  completionDate: { flex: 1 },
  completionNote: { fontSize: 12, maxWidth: 140 },
  spacer: { height: 24 },
});
