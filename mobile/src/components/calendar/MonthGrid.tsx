import { View, Text, FlatList } from 'react-native';
import {
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  getDay,
  format,
} from 'date-fns';
import { DayCell } from './DayCell';
import type { Completion } from '../../api/habits';

const DAY_LABELS_SUN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const DAY_LABELS_MON = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

interface MonthGridProps {
  month: Date;
  completions: Completion[];
  totalHabits: number;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  weekStartsOn: 0 | 1;
}

export function MonthGrid({
  month,
  completions,
  totalHabits,
  selectedDate,
  onSelectDate,
  weekStartsOn,
}: MonthGridProps) {
  const dayLabels = weekStartsOn === 1 ? DAY_LABELS_MON : DAY_LABELS_SUN;
  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });

  // Build completion count map: date string → count
  const countMap: Record<string, number> = {};
  for (const c of completions) {
    countMap[c.date] = (countMap[c.date] ?? 0) + 1;
  }

  // Leading empty cells
  const firstDayOfWeek = getDay(days[0]);
  const leadingBlanks = (firstDayOfWeek - weekStartsOn + 7) % 7;
  const cells: (Date | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...days,
  ];

  return (
    <View>
      {/* Day labels */}
      <View className="flex-row mb-1">
        {dayLabels.map((d) => (
          <View key={d} style={{ flex: 1, alignItems: 'center' }}>
            <Text className="text-xs font-medium text-gray-400 dark:text-gray-500">{d}</Text>
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
          if (!item) return <View style={{ flex: 1, aspectRatio: 1, margin: 2 }} />;
          const dateStr = format(item, 'yyyy-MM-dd');
          return (
            <DayCell
              date={item}
              completionCount={countMap[dateStr] ?? 0}
              totalHabits={totalHabits}
              isSelected={selectedDate === dateStr}
              onPress={(d) => onSelectDate(format(d, 'yyyy-MM-dd'))}
            />
          );
        }}
      />
    </View>
  );
}
