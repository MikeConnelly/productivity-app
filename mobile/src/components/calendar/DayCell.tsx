import { Pressable, Text, View } from 'react-native';
import { format, isToday } from 'date-fns';

interface DayCellProps {
  date: Date;
  completionCount: number;
  totalHabits: number;
  isSelected: boolean;
  onPress: (date: Date) => void;
}

export function DayCell({ date, completionCount, totalHabits, isSelected, onPress }: DayCellProps) {
  const today = isToday(date);
  const ratio = totalHabits > 0 ? completionCount / totalHabits : 0;

  // Completion shading
  const getShade = () => {
    if (ratio === 0) return 'transparent';
    if (ratio < 0.34) return '#c7d2fe'; // indigo-200
    if (ratio < 0.67) return '#818cf8'; // indigo-400
    return '#6366f1';                    // indigo-500
  };

  return (
    <Pressable
      onPress={() => onPress(date)}
      style={{
        flex: 1,
        aspectRatio: 1,
        margin: 2,
        borderRadius: 8,
        backgroundColor: getShade(),
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: today ? 2 : isSelected ? 2 : 0,
        borderColor: today ? '#6366f1' : isSelected ? '#f97316' : 'transparent',
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: today ? '700' : '400',
          color: ratio >= 0.67 ? '#fff' : '#374151',
        }}
      >
        {format(date, 'd')}
      </Text>
    </Pressable>
  );
}
