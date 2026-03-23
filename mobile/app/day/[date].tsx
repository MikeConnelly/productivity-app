import { View, Text, Pressable, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { format } from 'date-fns';
import { ChevronLeft, MessageSquare } from 'lucide-react-native';
import { useHabits, useTodayCompletions } from '../../src/hooks/useHabits';
import { useLogs, useDayLogEntries } from '../../src/hooks/useLogs';
import { HabitCard } from '../../src/components/habits/HabitCard';
import { useTheme } from '../../src/context/ThemeContext';
import { habitsApi } from '../../src/api/habits';
import { queryKeys } from '../../src/lib/queryKeys';
import { useQueryClient } from '@tanstack/react-query';

export default function DayScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isDark } = useTheme();

  const { habits, loading: habitsLoading } = useHabits();
  const { completions, setCompletions, loading: completionsLoading } = useTodayCompletions(date!);
  const { logs, loading: logsLoading } = useLogs();
  const { entries: logEntries, loading: logEntriesLoading } = useDayLogEntries(date!);

  const displayDate = date ? format(new Date(date + 'T12:00:00'), 'EEEE, MMMM d') : '';
  const completedCount = completions.length;
  const totalCount = habits.length;
  const progress = totalCount > 0 ? completedCount / totalCount : 0;

  const handleToggle = async (habitId: string, completed: boolean, note?: string) => {
    if (completed) {
      const optimistic = { habitId, date: date!, completedAt: new Date().toISOString(), note };
      setCompletions((prev) => [...prev.filter((c) => c.habitId !== habitId), optimistic]);
      try {
        const result = await habitsApi.complete(habitId, date!, note || undefined);
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
        await habitsApi.uncomplete(habitId, date!);
      } catch {
        setCompletions((prev) => [...prev, { habitId, date: date!, completedAt: new Date().toISOString() }]);
      }
    }
  };

  const completionMap = new Map(completions.map((c) => [c.habitId, c]));
  const entryMap = new Map(logEntries.map((e) => [e.logId, e]));
  const loading = habitsLoading || completionsLoading;

  const card = isDark ? '#1f2937' : '#fff';
  const bg = isDark ? '#111827' : '#f9fafb';
  const textPrimary = isDark ? '#f3f4f6' : '#111827';
  const textSecondary = isDark ? '#9ca3af' : '#6b7280';
  const textMuted = isDark ? '#6b7280' : '#9ca3af';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Back button */}
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
          <ChevronLeft size={20} color="#6366f1" />
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={[styles.dateTitle, { color: textPrimary }]}>{displayDate}</Text>
          <Text style={[styles.progress, { color: textSecondary }]}>
            {completedCount}/{totalCount} habits completed
          </Text>
          {totalCount > 0 && (
            <View style={[styles.progressBarBg, { backgroundColor: isDark ? '#374151' : '#e5e7eb' }]}>
              <View
                style={[styles.progressBarFill, { width: `${progress * 100}%` as any }]}
              />
            </View>
          )}
        </View>

        {/* Habits */}
        <Text style={[styles.sectionLabel, { color: textSecondary }]}>HABITS</Text>
        {loading ? (
          <ActivityIndicator color="#6366f1" style={styles.loader} />
        ) : habits.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: card }]}>
            <Text style={[styles.emptyText, { color: textMuted }]}>No active habits</Text>
          </View>
        ) : (
          habits.map((habit) => (
            <HabitCard
              key={habit.habitId}
              habit={habit}
              completion={completionMap.get(habit.habitId)}
              onToggle={handleToggle}
            />
          ))
        )}

        {/* Logs */}
        <Text style={[styles.sectionLabel, { color: textSecondary, marginTop: 24 }]}>DAILY LOGS</Text>
        {logsLoading || logEntriesLoading ? (
          <ActivityIndicator color="#6366f1" style={styles.loader} />
        ) : logs.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: card }]}>
            <Text style={[styles.emptyText, { color: textMuted }]}>No active logs</Text>
          </View>
        ) : (
          logs.map((log) => {
            const entry = entryMap.get(log.logId);
            return (
              <Pressable
                key={log.logId}
                onPress={() => router.push(`/logs/${log.logId}/entries/${date}` as any)}
                style={[styles.logCard, { backgroundColor: card, borderLeftColor: log.color }]}
              >
                <View
                  style={[
                    styles.logIcon,
                    {
                      borderColor: entry ? log.color : '#d1d5db',
                      backgroundColor: entry ? log.color : 'transparent',
                    },
                  ]}
                >
                  <MessageSquare
                    size={14}
                    color={entry ? '#fff' : '#9ca3af'}
                    fill={entry ? '#fff' : 'none'}
                  />
                </View>
                <View style={styles.logInfo}>
                  <Text style={[styles.logName, { color: textPrimary }]}>{log.name}</Text>
                  <Text
                    style={[styles.logPreview, { color: entry ? textSecondary : textMuted }]}
                    numberOfLines={1}
                  >
                    {entry ? entry.content : 'Write entry…'}
                  </Text>
                </View>
              </Pressable>
            );
          })
        )}

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16 },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16 },
  backText: { fontSize: 14, color: '#6366f1' },
  headerSection: { marginBottom: 24 },
  dateTitle: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  progress: { fontSize: 13, marginBottom: 8 },
  progressBarBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#6366f1', borderRadius: 4 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  loader: { marginVertical: 16 },
  emptyCard: { borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 8 },
  emptyText: { fontSize: 14 },
  logCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  logIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logInfo: { flex: 1 },
  logName: { fontSize: 15, fontWeight: '500', marginBottom: 2 },
  logPreview: { fontSize: 13 },
  spacer: { height: 24 },
});
