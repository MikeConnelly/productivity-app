import { View, Text, StyleSheet } from 'react-native';
import { Flame, Trophy } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

interface StreakBadgeProps {
  currentStreak: number;
  longestStreak: number;
}

export function StreakBadge({ currentStreak, longestStreak }: StreakBadgeProps) {
  const { isDark } = useTheme();

  return (
    <View style={styles.row}>
      <View style={[styles.badge, { backgroundColor: isDark ? 'rgba(124,45,18,0.3)' : '#fff7ed' }]}>
        <Flame size={16} color="#f97316" />
        <Text style={styles.currentValue}>{currentStreak}</Text>
        <Text style={styles.currentLabel}>current</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: isDark ? 'rgba(113,63,18,0.3)' : '#fefce8' }]}>
        <Trophy size={16} color="#eab308" />
        <Text style={styles.bestValue}>{longestStreak}</Text>
        <Text style={styles.bestLabel}>best</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  currentValue: { fontSize: 14, fontWeight: '600', color: '#f97316' },
  currentLabel: { fontSize: 12, color: '#fb923c' },
  bestValue: { fontSize: 14, fontWeight: '600', color: '#eab308' },
  bestLabel: { fontSize: 12, color: '#facc15' },
});
