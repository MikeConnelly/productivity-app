import { Pressable, Text } from 'react-native';
import { format, isToday } from 'date-fns';

interface DayCellProps {
  date: Date;
  level: 0 | 1 | 2 | 3 | 4;
  color: string;
  isSelected: boolean;
  onPress: (date: Date) => void;
}

const OPACITY_SUFFIXES = ['', '33', '80', 'BF', 'FF'];

export function DayCell({ date, level, color, isSelected, onPress }: DayCellProps) {
  const today = isToday(date);
  const bg = level === 0 ? 'transparent' : `${color}${OPACITY_SUFFIXES[level]}`;
  const textDark = level >= 3;

  return (
    <Pressable
      onPress={() => onPress(date)}
      style={{
        flex: 1,
        aspectRatio: 1,
        margin: 2,
        borderRadius: 8,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: today || isSelected ? 2 : 0,
        borderColor: today ? color : isSelected ? '#f97316' : 'transparent',
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: today ? '700' : '400',
          color: textDark ? '#fff' : '#374151',
        }}
      >
        {format(date, 'd')}
      </Text>
    </Pressable>
  );
}
