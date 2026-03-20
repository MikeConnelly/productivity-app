import { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { format } from 'date-fns';
import { ChevronLeft, Edit2 } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useLogs } from '../../../src/hooks/useLogs';
import { logsApi } from '../../../src/api/logs';
import { queryKeys } from '../../../src/lib/queryKeys';
import { LogForm } from '../../../src/components/logs/LogForm';
import { useQuery } from '@tanstack/react-query';

export default function LogDetailScreen() {
  const { logId } = useLocalSearchParams<{ logId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
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
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center">
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
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Pressable onPress={() => router.back()} className="flex-row items-center mb-4" hitSlop={8}>
          <ChevronLeft size={20} color="#6366f1" />
          <Text className="text-indigo-500 font-medium ml-1">Today</Text>
        </Pressable>

        {/* Header */}
        <View
          className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm mb-4"
          style={{ borderLeftWidth: 4, borderLeftColor: log.color }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <Text style={{ fontSize: 32 }}>{log.icon}</Text>
              <Text className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {log.name}
              </Text>
            </View>
            <Pressable
              onPress={() => setShowEdit(true)}
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
              hitSlop={8}
            >
              <Edit2 size={18} color="#6366f1" />
            </Pressable>
          </View>
        </View>

        <Text className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
          Entry History
        </Text>
        {loading ? (
          <ActivityIndicator color="#6366f1" className="my-4" />
        ) : sorted.length === 0 ? (
          <View className="bg-white dark:bg-gray-800 rounded-xl p-4 items-center">
            <Text className="text-gray-400 dark:text-gray-500 text-sm">No entries yet</Text>
          </View>
        ) : (
          sorted.map((entry) => (
            <Pressable
              key={entry.date}
              onPress={() => router.push(`/logs/${logId}/entries/${entry.date}`)}
              className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3 mb-2 shadow-sm"
            >
              <Text className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                {format(new Date(entry.date + 'T12:00:00'), 'EEE, MMM d, yyyy')}
              </Text>
              <Text
                className="text-xs text-gray-500 dark:text-gray-400"
                numberOfLines={2}
              >
                {entry.content}
              </Text>
            </Pressable>
          ))
        )}

        <View className="h-6" />
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
