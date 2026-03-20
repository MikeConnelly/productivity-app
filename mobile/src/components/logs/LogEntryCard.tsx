import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, FileText } from 'lucide-react-native';
import type { Log, LogEntry } from '../../api/logs';

interface LogEntryCardProps {
  log: Log;
  entry?: LogEntry;
  date: string;
}

export function LogEntryCard({ log, entry, date }: LogEntryCardProps) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/logs/${log.logId}/entries/${date}`)}
      className="flex-row items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-2"
      style={{ borderLeftWidth: 4, borderLeftColor: log.color }}
    >
      <Text style={{ fontSize: 20 }}>{log.icon}</Text>

      <View className="flex-1" style={{ minWidth: 0 }}>
        <Text
          className="font-medium text-gray-900 dark:text-gray-100"
          numberOfLines={1}
        >
          {log.name}
        </Text>
        {entry?.content ? (
          <Text className="text-xs text-gray-400 dark:text-gray-500 mt-0.5" numberOfLines={1}>
            {entry.content}
          </Text>
        ) : (
          <Text className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Tap to add entry…
          </Text>
        )}
      </View>

      {entry?.content && (
        <FileText size={16} color="#9ca3af" />
      )}
      <ChevronRight size={18} color="#9ca3af" />
    </Pressable>
  );
}
