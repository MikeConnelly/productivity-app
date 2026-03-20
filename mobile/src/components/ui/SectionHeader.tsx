import { View, Text, Pressable } from 'react-native';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View className="flex-row items-center justify-between mb-2">
      <Text className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
        {title}
      </Text>
      {actionLabel && onAction && (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text className="text-sm font-medium text-indigo-500">{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}
