import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { format } from 'date-fns';
import { ChevronLeft } from 'lucide-react-native';
import { useLogs } from '../../../../src/hooks/useLogs';
import { logsApi } from '../../../../src/api/logs';
import { queryKeys } from '../../../../src/lib/queryKeys';
import { useQuery, useQueryClient } from '@tanstack/react-query';

type SaveStatus = 'idle' | 'saving' | 'saved';

export default function LogEntryEditorScreen() {
  const { logId, date } = useLocalSearchParams<{ logId: string; date: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
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
      // Invalidate history and day entries
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ChevronLeft size={22} color="#6366f1" />
          </Pressable>
          <View className="flex-1 ml-2">
            <Text className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {log?.icon} {log?.name}
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">{displayDate}</Text>
          </View>
          <Text
            className="text-xs"
            style={{
              color:
                status === 'saving'
                  ? '#6366f1'
                  : status === 'saved'
                  ? '#22c55e'
                  : 'transparent',
            }}
          >
            {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved' : '.'}
          </Text>
        </View>

        <ScrollView className="flex-1" keyboardDismissMode="interactive">
          <TextInput
            value={content}
            onChangeText={handleChange}
            placeholder="Write your entry…"
            placeholderTextColor="#9ca3af"
            multiline
            textAlignVertical="top"
            className="flex-1 text-base text-gray-900 dark:text-gray-100 p-4"
            style={{ minHeight: 400 }}
            autoFocus={!entry?.content}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
