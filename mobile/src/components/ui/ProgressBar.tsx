import { View } from 'react-native';

interface ProgressBarProps {
  value: number; // 0–1
}

export function ProgressBar({ value }: ProgressBarProps) {
  const pct = Math.min(1, Math.max(0, value));
  return (
    <View className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <View
        className="h-full bg-indigo-500 rounded-full"
        style={{ width: `${Math.round(pct * 100)}%` }}
      />
    </View>
  );
}
