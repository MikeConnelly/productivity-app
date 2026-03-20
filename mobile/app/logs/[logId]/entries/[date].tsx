import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { format } from 'date-fns';
import { ChevronLeft } from 'lucide-react-native';
import { useLogs } from '../../../../src/hooks/useLogs';
import { logsApi } from '../../../../src/api/logs';
import { queryKeys } from '../../../../src/lib/queryKeys';
import { useTheme } from '../../../../src/context/ThemeContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';

type SaveStatus = 'idle' | 'saving' | 'saved';

export default function LogEntryEditorScreen() {
  const { logId, date } = useLocalSearchParams<{ logId: string; date: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isDark } = useTheme();
  const { logs } = useLogs();
  const log = logs.find((l) => l.logId === logId);

  const { data: entry } = useQuery({
    queryKey: ['log-entry', logId, date],
    queryFn: () => logsApi.getEntry(logId, date).catch(() => null),
    enabled: !!logId && !!date,
    staleTime: 30 * 1000,
  });

  const [content, setContent] = useState('');
  const [status, setStatus] = useState<SaveStatus>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (entry && !initializedRef.current) {
      setContent(entry.content ?? '');
      initializedRef.current = true;
    }
  }, [entry]);

  const save = async (text: string) => {
    if (!logId || !date) return;
    setStatus('saving');
    try {
      const updated = await logsApi.upsertEntry(logId, date, text);
      queryClient.setQueryData(['log-entry', logId, date], updated);
      queryClient.invalidateQueries({ queryKey: queryKeys.logHistory(logId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dayLogEntries(date) });
      setStatus('saved');
    } catch {
      setStatus('idle');
    }
  };

  const handleChange = (text: string) => {
    setContent(text);
    setStatus('idle');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => save(text), 1500);
  };

  const displayDate = date
    ? format(new Date(date + 'T12:00:00'), 'EEEE, MMMM d, yyyy')
    : '';

  const saveStatusColor =
    status === 'saving' ? '#6366f1' : status === 'saved' ? '#22c55e' : 'transparent';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#111827' : '#f9fafb' }]} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: isDark ? '#374151' : '#e5e7eb' }]}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ChevronLeft size={22} color="#6366f1" />
          </Pressable>
          <View style={styles.headerTitle}>
            <Text style={[styles.headerName, { color: isDark ? '#f3f4f6' : '#111827' }]}>
              {log?.icon} {log?.name}
            </Text>
            <Text style={[styles.headerDate, { color: isDark ? '#9ca3af' : '#6b7280' }]}>{displayDate}</Text>
          </View>
          <Text style={[styles.saveStatus, { color: saveStatusColor }]}>
            {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved' : '.'}
          </Text>
        </View>

        <ScrollView style={styles.scrollView} keyboardDismissMode="interactive">
          <TextInput
            value={content}
            onChangeText={handleChange}
            placeholder="Write your entry…"
            placeholderTextColor="#9ca3af"
            multiline
            textAlignVertical="top"
            style={[styles.editor, { color: isDark ? '#f3f4f6' : '#111827' }]}
            autoFocus={!entry?.content}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { flex: 1, marginLeft: 8 },
  headerName: { fontSize: 16, fontWeight: '600' },
  headerDate: { fontSize: 12 },
  saveStatus: { fontSize: 12 },
  scrollView: { flex: 1 },
  editor: {
    flex: 1,
    fontSize: 16,
    padding: 16,
    minHeight: 400,
  },
});
