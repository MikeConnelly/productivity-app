import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  secondActionLabel?: string;
  onSecondAction?: () => void;
  secondActionActive?: boolean;
}

export function SectionHeader({ title, actionLabel, onAction, secondActionLabel, onSecondAction, secondActionActive }: SectionHeaderProps) {
  const { isDark } = useTheme();

  return (
    <View style={styles.row}>
      <Text style={[styles.title, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
        {title}
      </Text>
      <View style={styles.actions}>
        {secondActionLabel && onSecondAction && (
          <Pressable
            onPress={onSecondAction}
            hitSlop={8}
            style={[
              styles.reorderBtn,
              secondActionActive
                ? { backgroundColor: isDark ? '#e5e7eb' : '#374151', borderColor: isDark ? '#e5e7eb' : '#374151' }
                : { borderColor: isDark ? '#4b5563' : '#d1d5db' },
            ]}
          >
            <Text style={[
              styles.reorderBtnText,
              secondActionActive
                ? { color: isDark ? '#111827' : '#fff' }
                : { color: isDark ? '#9ca3af' : '#6b7280' },
            ]}>
              {secondActionLabel}
            </Text>
          </Pressable>
        )}
        {actionLabel && onAction && (
          <Pressable onPress={onAction} hitSlop={8}>
            <Text style={styles.action}>{actionLabel}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  action: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6366f1',
  },
  reorderBtn: {
    borderWidth: 1,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  reorderBtnText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
