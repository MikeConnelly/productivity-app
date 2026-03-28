import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { ChevronUp, ChevronDown } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import { habitsApi, type Habit } from '../../src/api/habits';
import { logsApi, type Log } from '../../src/api/logs';
import { useHabits, useTodayCompletions } from '../../src/hooks/useHabits';
import { useLogs, useDayLogEntries } from '../../src/hooks/useLogs';
import { queryKeys } from '../../src/lib/queryKeys';
import { HabitCard } from '../../src/components/habits/HabitCard';
import { HabitForm } from '../../src/components/habits/HabitForm';
import { LogEntryCard } from '../../src/components/logs/LogEntryCard';
import { LogForm } from '../../src/components/logs/LogForm';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { SectionHeader } from '../../src/components/ui/SectionHeader';
import { useTheme } from '../../src/context/ThemeContext';

const today = format(new Date(), 'yyyy-MM-dd');

export default function TodayScreen() {
  const queryClient = useQueryClient();
  const { isDark } = useTheme();
  const { habits, loading: habitsLoading, setHabits } = useHabits();
  const { completions, setCompletions } = useTodayCompletions(today);
  const { logs, loading: logsLoading, setLogs } = useLogs();
  const { entries } = useDayLogEntries(today);

  const [showHabitForm, setShowHabitForm] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [reorderingHabits, setReorderingHabits] = useState(false);
  const [reorderingLogs, setReorderingLogs] = useState(false);

  const moveHabit = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= habits.length) return;
    setHabits((prev: Habit[]) => {
      const next = [...prev];
      [next[index], next[newIndex]] = [next[newIndex], next[index]];
      habitsApi.reorder(next.map((h) => h.habitId)).catch(console.error);
      return next;
    });
  };

  const moveLog = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= logs.length) return;
    setLogs((prev: Log[]) => {
      const next = [...prev];
      [next[index], next[newIndex]] = [next[newIndex], next[index]];
      logsApi.reorder(next.map((l) => l.logId)).catch(console.error);
      return next;
    });
  };

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
      const optimistic = { habitId, date: today, completedAt: new Date().toISOString(), note };
      setCompletions((prev) => [...prev.filter((c) => c.habitId !== habitId), optimistic]);
      try {
        const result = await habitsApi.complete(habitId, today, note || undefined);
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
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#111827' : '#f9fafb' }]} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={[styles.dateText, { color: isDark ? '#f3f4f6' : '#111827' }]}>
            {format(new Date(), 'EEEE, MMMM d')}
          </Text>
          <Text style={[styles.countText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
            {completedCount} of {habits.length} habits done
          </Text>
          <View style={styles.progressContainer}>
            <ProgressBar value={habits.length > 0 ? completedCount / habits.length : 0} />
          </View>
        </View>

        {/* Habits */}
        <SectionHeader
          title="Habits"
          actionLabel="Add"
          onAction={() => setShowHabitForm(true)}
          secondActionLabel={reorderingHabits ? 'Done' : 'Reorder'}
          onSecondAction={habits.length > 1 ? () => setReorderingHabits((v) => !v) : undefined}
          secondActionActive={reorderingHabits}
        />
        {habitsLoading ? (
          <ActivityIndicator color="#6366f1" style={styles.loader} />
        ) : habits.length === 0 ? (
          <Pressable
            onPress={() => setShowHabitForm(true)}
            style={[styles.emptyCard, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}
          >
            <Text style={[styles.emptyText, { color: isDark ? '#6b7280' : '#9ca3af' }]}>No habits yet</Text>
            <Text style={styles.emptyAction}>+ Add your first habit</Text>
          </Pressable>
        ) : (
          habits.map((habit, index) => (
            <View key={habit.habitId} style={reorderingHabits ? styles.reorderRow : undefined}>
              {reorderingHabits && (
                <View style={styles.reorderButtons}>
                  <Pressable
                    onPress={() => moveHabit(index, -1)}
                    disabled={index === 0}
                    style={[styles.reorderBtn, { opacity: index === 0 ? 0.3 : 1 }]}
                    hitSlop={6}
                  >
                    <ChevronUp size={18} color={isDark ? '#9ca3af' : '#6b7280'} />
                  </Pressable>
                  <Pressable
                    onPress={() => moveHabit(index, 1)}
                    disabled={index === habits.length - 1}
                    style={[styles.reorderBtn, { opacity: index === habits.length - 1 ? 0.3 : 1 }]}
                    hitSlop={6}
                  >
                    <ChevronDown size={18} color={isDark ? '#9ca3af' : '#6b7280'} />
                  </Pressable>
                </View>
              )}
              <View style={reorderingHabits ? styles.reorderCardFlex : undefined}>
                <HabitCard
                  habit={habit}
                  completion={completions.find((c) => c.habitId === habit.habitId)}
                  onToggle={handleToggle}
                />
              </View>
            </View>
          ))
        )}

        {/* Logs */}
        <View style={styles.logsSection}>
          <SectionHeader
            title="Logs"
            actionLabel="Add"
            onAction={() => setShowLogForm(true)}
            secondActionLabel={reorderingLogs ? 'Done' : 'Reorder'}
            onSecondAction={logs.length > 1 ? () => setReorderingLogs((v) => !v) : undefined}
            secondActionActive={reorderingLogs}
          />
          {logs.length > 0 && (() => {
            const logCompletedCount = entries.filter((e) => !!e.content).length;
            const logTotalCount = logs.length;
            return (
              <View style={styles.logProgressSection}>
                <Text style={[styles.countText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
                  {logCompletedCount} of {logTotalCount} logs done
                </Text>
                <View style={styles.progressContainer}>
                  <ProgressBar value={logTotalCount > 0 ? logCompletedCount / logTotalCount : 0} />
                </View>
              </View>
            );
          })()}
          {logsLoading ? (
            <ActivityIndicator color="#6366f1" style={styles.loader} />
          ) : logs.length === 0 ? (
            <Pressable
              onPress={() => setShowLogForm(true)}
              style={[styles.emptyCard, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}
            >
              <Text style={[styles.emptyText, { color: isDark ? '#6b7280' : '#9ca3af' }]}>No logs yet</Text>
              <Text style={styles.emptyAction}>+ Add your first log</Text>
            </Pressable>
          ) : (
            logs.map((log, index) => (
              <View key={log.logId} style={reorderingLogs ? styles.reorderRow : undefined}>
                {reorderingLogs && (
                  <View style={styles.reorderButtons}>
                    <Pressable
                      onPress={() => moveLog(index, -1)}
                      disabled={index === 0}
                      style={[styles.reorderBtn, { opacity: index === 0 ? 0.3 : 1 }]}
                      hitSlop={6}
                    >
                      <ChevronUp size={18} color={isDark ? '#9ca3af' : '#6b7280'} />
                    </Pressable>
                    <Pressable
                      onPress={() => moveLog(index, 1)}
                      disabled={index === logs.length - 1}
                      style={[styles.reorderBtn, { opacity: index === logs.length - 1 ? 0.3 : 1 }]}
                      hitSlop={6}
                    >
                      <ChevronDown size={18} color={isDark ? '#9ca3af' : '#6b7280'} />
                    </Pressable>
                  </View>
                )}
                <View style={reorderingLogs ? styles.reorderCardFlex : undefined}>
                  <LogEntryCard
                    log={log}
                    entry={entries.find((e) => e.logId === log.logId)}
                    date={today}
                  />
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.spacer} />
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  headerSection: { marginBottom: 20 },
  dateText: { fontSize: 22, fontWeight: '700' },
  countText: { fontSize: 14, marginTop: 2 },
  progressContainer: { marginTop: 12 },
  loader: { marginVertical: 16 },
  emptyCard: { alignItems: 'center', paddingVertical: 32, borderRadius: 12, marginBottom: 16 },
  emptyText: { marginBottom: 4 },
  emptyAction: { color: '#6366f1', fontSize: 14, fontWeight: '500' },
  logsSection: { marginTop: 16 },
  logProgressSection: { marginBottom: 12 },
  spacer: { height: 24 },
  reorderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reorderButtons: { flexDirection: 'column', alignItems: 'center', gap: 2 },
  reorderBtn: { padding: 2 },
  reorderCardFlex: { flex: 1 },
});
