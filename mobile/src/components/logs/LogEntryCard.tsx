import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, MessageSquare } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import type { Log, LogEntry } from '../../api/logs';

interface LogEntryCardProps {
  log: Log;
  entry?: LogEntry;
  date: string;
}

export function LogEntryCard({ log, entry, date }: LogEntryCardProps) {
  const router = useRouter();
  const { isDark } = useTheme();
  const isComplete = !!entry?.content;
  const editUrl = `/logs/${log.logId}/entries/${date}`;

  return (
    <View
      style={[styles.card, { backgroundColor: isDark ? '#1f2937' : '#fff', borderLeftColor: log.color }]}
    >
      {/* MessageSquare "checkbox" */}
      <Pressable
        onPress={() => router.push(editUrl)}
        style={[
          styles.checkbox,
          {
            borderColor: isComplete ? log.color : '#d1d5db',
            backgroundColor: isComplete ? log.color : 'transparent',
          },
        ]}
        hitSlop={10}
      >
        <MessageSquare
          size={14}
          color={isComplete ? '#fff' : (isDark ? '#6b7280' : '#9ca3af')}
          fill={isComplete ? '#fff' : 'none'}
        />
      </Pressable>

      {/* Content — tappable to edit */}
      <Pressable
        onPress={() => router.push(editUrl)}
        style={styles.contentRow}
      >
        <Text style={styles.icon}>{log.icon}</Text>
        <View style={styles.textContainer}>
          <Text
            style={[styles.name, { color: isComplete ? (isDark ? '#6b7280' : '#9ca3af') : (isDark ? '#f3f4f6' : '#111827') }]}
            numberOfLines={1}
          >
            {log.name}
          </Text>
          <Text style={[styles.preview, { color: isDark ? '#6b7280' : '#9ca3af' }]} numberOfLines={1}>
            {entry?.content ? entry.content : 'Write entry…'}
          </Text>
        </View>
      </Pressable>

      <ChevronRight size={18} color="#9ca3af" />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  contentRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 0 },
  icon: { fontSize: 20, flexShrink: 0 },
  textContainer: { flex: 1, minWidth: 0 },
  name: { fontWeight: '500', fontSize: 14 },
  preview: { fontSize: 12, marginTop: 2 },
});
