import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { Expand, MessageSquare } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useDayLogEntries } from '../../hooks/useLogs';
import type { Habit, Completion } from '../../api/habits';
import type { Log } from '../../api/logs';

interface DayDetailProps {
  date: string;
  habits: Habit[];
  completions: Completion[];
  logs: Log[];
  onToggle: (habitId: string, completed: boolean, note?: string) => void;
}

export function DayDetail({ date, habits, completions, logs, onToggle }: DayDetailProps) {
  const { isDark } = useTheme();
  const router = useRouter();
  const { entries: logEntries, loading: logEntriesLoading } = useDayLogEntries(date);

  const completionMap = new Map(completions.map((c) => [c.habitId, c]));
  const displayDate = format(new Date(date + 'T12:00:00'), 'EEEE, MMMM d');

  const card = isDark ? '#1f2937' : '#fff';
  const border = isDark ? '#374151' : '#e5e7eb';
  const textPrimary = isDark ? '#f3f4f6' : '#111827';
  const textSecondary = isDark ? '#9ca3af' : '#6b7280';
  const textMuted = isDark ? '#6b7280' : '#9ca3af';

  return (
    <View style={[styles.card, { backgroundColor: card, borderColor: border }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.dateText, { color: textPrimary }]} numberOfLines={1}>
          {displayDate}
        </Text>
        <Pressable
          onPress={() => router.push(`/day/${date}` as any)}
          style={styles.fullViewButton}
          hitSlop={8}
        >
          <Expand size={14} color="#6366f1" />
          <Text style={styles.fullViewText}>Full view</Text>
        </Pressable>
      </View>

      {/* Habits */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: textSecondary }]}>HABITS</Text>
        {habits.length === 0 ? (
          <Text style={[styles.emptyText, { color: textMuted }]}>No active habits</Text>
        ) : (
          habits.map((habit) => {
            const completion = completionMap.get(habit.habitId);
            const isCompleted = !!completion;
            return (
              <Pressable
                key={habit.habitId}
                onPress={() => onToggle(habit.habitId, !isCompleted)}
                style={styles.habitRow}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: isCompleted ? habit.color : '#d1d5db',
                      backgroundColor: isCompleted ? habit.color : 'transparent',
                    },
                  ]}
                >
                  {isCompleted && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <View style={styles.habitInfo}>
                  <Text
                    style={[styles.habitName, { color: isCompleted ? textPrimary : textMuted }]}
                    numberOfLines={1}
                  >
                    {habit.name}
                  </Text>
                  {completion?.note && (
                    <Text style={[styles.note, { color: textMuted }]} numberOfLines={1}>
                      "{completion.note}"
                    </Text>
                  )}
                </View>
              </Pressable>
            );
          })
        )}
      </View>

      {/* Logs */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: textSecondary }]}>LOGS</Text>
        {logEntriesLoading ? (
          <ActivityIndicator size="small" color="#6366f1" />
        ) : logs.length === 0 ? (
          <Text style={[styles.emptyText, { color: textMuted }]}>No active logs</Text>
        ) : (
          logs.map((log) => {
            const entry = logEntries.find((e) => e.logId === log.logId);
            return (
              <Pressable
                key={log.logId}
                onPress={() => router.push(`/logs/${log.logId}/entries/${date}` as any)}
                style={styles.logRow}
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
                    size={11}
                    color={entry ? '#fff' : '#9ca3af'}
                    fill={entry ? '#fff' : 'none'}
                  />
                </View>
                <Text style={[styles.logName, { color: textPrimary }]}>{log.name}:</Text>
                <Text
                  style={[styles.logEntry, { color: entry ? '#6366f1' : textMuted }]}
                  numberOfLines={1}
                >
                  {entry ? entry.content : '—'}
                </Text>
              </Pressable>
            );
          })
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 16,
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: { fontSize: 15, fontWeight: '600', flex: 1, marginRight: 8 },
  fullViewButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  fullViewText: { fontSize: 12, color: '#6366f1' },
  section: { gap: 6 },
  sectionLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8 },
  emptyText: { fontSize: 13 },
  habitRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkmark: { color: '#fff', fontSize: 12, lineHeight: 14 },
  habitInfo: { flex: 1 },
  habitName: { fontSize: 13 },
  note: { fontSize: 11, marginTop: 1 },
  logRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logIcon: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logName: { fontSize: 13, fontWeight: '500', flexShrink: 0 },
  logEntry: { fontSize: 13, flex: 1 },
});
