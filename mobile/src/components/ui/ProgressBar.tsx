import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface ProgressBarProps {
  value: number; // 0–1
}

export function ProgressBar({ value }: ProgressBarProps) {
  const { isDark } = useTheme();
  const pct = Math.min(1, Math.max(0, value));
  return (
    <View style={[styles.track, { backgroundColor: isDark ? '#374151' : '#e5e7eb' }]}>
      <View style={[styles.fill, { width: `${Math.round(pct * 100)}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 999,
  },
});
