import { View, Text, FlatList, StyleSheet } from 'react-native';
import {
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  getDay,
  format,
} from 'date-fns';
import { DayCell } from './DayCell';
import { useTheme } from '../../context/ThemeContext';
import type { Completion } from '../../api/habits';
import type { LogEntry } from '../../api/logs';

const DAY_LABELS_SUN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const DAY_LABELS_MON = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

type Mode = 'habits' | 'logs';

interface MonthGridProps {
  month: Date;
  completions: Completion[];
  totalHabits: number;
  logEntries: LogEntry[];
  totalLogs: number;
  mode: Mode;
  selectedId: string | null;
  color: string;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  weekStartsOn: 0 | 1;
}

function getLevel(ratio: number): 0 | 1 | 2 | 3 | 4 {
  if (ratio === 0) return 0;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

export function MonthGrid({
  month,
  completions,
  totalHabits,
  logEntries,
  totalLogs,
  mode,
  selectedId,
  color,
  selectedDate,
  onSelectDate,
  weekStartsOn,
}: MonthGridProps) {
  const { isDark } = useTheme();
  const dayLabels = weekStartsOn === 1 ? DAY_LABELS_MON : DAY_LABELS_SUN;
  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });

  // Build lookup maps for habits
  const habitCountMap: Record<string, number> = {};
  const habitHasId: Record<string, boolean> = {};
  for (const c of completions) {
    habitCountMap[c.date] = (habitCountMap[c.date] ?? 0) + 1;
    if (selectedId && c.habitId === selectedId) habitHasId[c.date] = true;
  }

  // Build lookup maps for logs
  const logCountMap: Record<string, number> = {};
  const logHasId: Record<string, boolean> = {};
  for (const e of logEntries) {
    logCountMap[e.date] = (logCountMap[e.date] ?? 0) + 1;
    if (selectedId && e.logId === selectedId) logHasId[e.date] = true;
  }

  const firstDayOfWeek = getDay(days[0]);
  const leadingBlanks = (firstDayOfWeek - weekStartsOn + 7) % 7;
  const cells: (Date | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...days,
  ];
  const remainder = cells.length % 7;
  if (remainder !== 0) {
    cells.push(...Array.from({ length: 7 - remainder }, () => null));
  }

  function cellLevel(dateStr: string): 0 | 1 | 2 | 3 | 4 {
    if (mode === 'habits') {
      if (selectedId) return habitHasId[dateStr] ? 4 : 0;
      return getLevel(totalHabits > 0 ? (habitCountMap[dateStr] ?? 0) / totalHabits : 0);
    } else {
      if (selectedId) return logHasId[dateStr] ? 4 : 0;
      return getLevel(totalLogs > 0 ? (logCountMap[dateStr] ?? 0) / totalLogs : 0);
    }
  }

  return (
    <View>
      {/* Day labels */}
      <View style={styles.labelRow}>
        {dayLabels.map((d) => (
          <View key={d} style={styles.labelCell}>
            <Text style={[styles.labelText, { color: isDark ? '#6b7280' : '#9ca3af' }]}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Grid */}
      <FlatList
        data={cells}
        numColumns={7}
        keyExtractor={(item, i) => item ? format(item, 'yyyy-MM-dd') : `blank-${i}`}
        scrollEnabled={false}
        renderItem={({ item }) => {
          if (!item) return <View style={styles.blankCell} />;
          const dateStr = format(item, 'yyyy-MM-dd');
          return (
            <DayCell
              date={item}
              level={cellLevel(dateStr)}
              color={color}
              isSelected={selectedDate === dateStr}
              onPress={(d) => onSelectDate(format(d, 'yyyy-MM-dd'))}
            />
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  labelRow: { flexDirection: 'row', marginBottom: 4 },
  labelCell: { flex: 1, alignItems: 'center' },
  labelText: { fontSize: 12, fontWeight: '500' },
  blankCell: { flex: 1, aspectRatio: 1, margin: 2 },
});
