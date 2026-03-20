import { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { format } from 'date-fns';
import { ChevronLeft, Edit2 } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useLogs } from '../../../src/hooks/useLogs';
import { logsApi } from '../../../src/api/logs';
import { queryKeys } from '../../../src/lib/queryKeys';
import { LogForm } from '../../../src/components/logs/LogForm';
import { useTheme } from '../../../src/context/ThemeContext';
import { useQuery } from '@tanstack/react-query';

export default function LogDetailScreen() {
  const { logId } = useLocalSearchParams<{ logId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isDark } = useTheme();
  const { logs } = useLogs();
  const [showEdit, setShowEdit] = useState(false);

  const log = logs.find((l) => l.logId === logId);

  const { data: history = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.logHistory(logId),
    queryFn: () => logsApi.getHistory(logId),
    enabled: !!logId,
    staleTime: 2 * 60 * 1000,
  });

  if (!log) {
    return (
      <SafeAreaView style={[styles.container, styles.centered, { backgroundColor: isDark ? '#111827' : '#f9fafb' }]}>
        <ActivityIndicator color="#6366f1" />
      </SafeAreaView>
    );
  }

  const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date));

  const handleDelete = async () => {
    await logsApi.delete(log.logId);
    queryClient.setQueryData(queryKeys.logs, (prev: typeof logs) =>
      prev.filter((l) => l.logId !== log.logId)
    );
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#111827' : '#f9fafb' }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
          <ChevronLeft size={20} color="#6366f1" />
          <Text style={styles.backText}>Today</Text>
        </Pressable>

        {/* Header */}
        <View
          style={[styles.headerCard, { backgroundColor: isDark ? '#1f2937' : '#fff', borderLeftColor: log.color }]}
        >
          <View style={styles.headerRow}>
            <View style={styles.logTitle}>
              <Text style={styles.logIcon}>{log.icon}</Text>
              <Text style={[styles.logName, { color: isDark ? '#f3f4f6' : '#111827' }]}>
                {log.name}
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
        </View>

        <Text style={[styles.sectionLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
          Entry History
        </Text>
        {loading ? (
          <ActivityIndicator color="#6366f1" style={styles.loader} />
        ) : sorted.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}>
            <Text style={[styles.emptyText, { color: isDark ? '#6b7280' : '#9ca3af' }]}>No entries yet</Text>
          </View>
        ) : (
          sorted.map((entry) => (
            <Pressable
              key={entry.date}
              onPress={() => router.push(`/logs/${logId}/entries/${entry.date}`)}
              style={[styles.entryCard, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}
            >
              <Text style={[styles.entryDate, { color: isDark ? '#f3f4f6' : '#111827' }]}>
                {format(new Date(entry.date + 'T12:00:00'), 'EEE, MMM d, yyyy')}
              </Text>
              <Text
                style={[styles.entryPreview, { color: isDark ? '#9ca3af' : '#6b7280' }]}
                numberOfLines={2}
              >
                {entry.content}
              </Text>
            </Pressable>
          ))
        )}

        <View style={styles.spacer} />
      </ScrollView>

      {showEdit && (
        <LogForm
          initial={log}
          onSave={async (data) => {
            const updated = await logsApi.update(log.logId, data);
            queryClient.setQueryData(queryKeys.logs, (prev: typeof logs) =>
              prev.map((l) => (l.logId === log.logId ? { ...l, ...updated } : l))
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
  logTitle: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logIcon: { fontSize: 32 },
  logName: { fontSize: 20, fontWeight: '700' },
  editButton: { padding: 8, borderRadius: 8 },
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
  entryCard: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  entryDate: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
  entryPreview: { fontSize: 12 },
  spacer: { height: 24 },
});
