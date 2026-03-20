import { View, Text } from 'react-native';
import { Flame, Trophy } from 'lucide-react-native';

interface StreakBadgeProps {
  currentStreak: number;
  longestStreak: number;
}

export function StreakBadge({ currentStreak, longestStreak }: StreakBadgeProps) {
  return (
    <View className="flex-row gap-3">
      <View className="flex-row items-center gap-1.5 bg-orange-50 dark:bg-orange-900/30 px-3 py-2 rounded-xl">
        <Flame size={16} color="#f97316" />
        <Text className="text-sm font-semibold text-orange-500">{currentStreak}</Text>
        <Text className="text-xs text-orange-400">current</Text>
      </View>
      <View className="flex-row items-center gap-1.5 bg-yellow-50 dark:bg-yellow-900/30 px-3 py-2 rounded-xl">
        <Trophy size={16} color="#eab308" />
        <Text className="text-sm font-semibold text-yellow-500">{longestStreak}</Text>
        <Text className="text-xs text-yellow-400">best</Text>
      </View>
    </View>
  );
}
