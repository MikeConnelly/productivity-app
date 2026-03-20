import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, FileText } from 'lucide-react-native';
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

  return (
    <Pressable
      onPress={() => router.push(`/logs/${log.logId}/entries/${date}`)}
      style={[styles.card, { backgroundColor: isDark ? '#1f2937' : '#fff', borderLeftColor: log.color }]}
    >
      <Text style={styles.icon}>{log.icon}</Text>

      <View style={styles.textContainer}>
        <Text
          style={[styles.name, { color: isDark ? '#f3f4f6' : '#111827' }]}
          numberOfLines={1}
        >
          {log.name}
        </Text>
        <Text style={[styles.preview, { color: isDark ? '#6b7280' : '#9ca3af' }]} numberOfLines={1}>
          {entry?.content ? entry.content : 'Tap to add entry…'}
        </Text>
      </View>

      {entry?.content && <FileText size={16} color="#9ca3af" />}
      <ChevronRight size={18} color="#9ca3af" />
    </Pressable>
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
  icon: { fontSize: 20 },
  textContainer: { flex: 1, minWidth: 0 },
  name: { fontWeight: '500' },
  preview: { fontSize: 12, marginTop: 2 },
});
