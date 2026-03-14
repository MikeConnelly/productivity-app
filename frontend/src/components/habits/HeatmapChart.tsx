import ActivityCalendar from 'react-activity-calendar';
import type { Completion } from '../../api/habits';
import { subYears, format } from 'date-fns';
import { useTheme } from '../../context/ThemeContext';

interface HeatmapChartProps {
  history: Completion[];
  color: string;
}

export function HeatmapChart({ history, color }: HeatmapChartProps) {
  const { theme } = useTheme();
  const today = new Date();
  const yearAgo = subYears(today, 1);

  const dateMap = new Map<string, number>();
  for (const c of history) {
    dateMap.set(c.date, (dateMap.get(c.date) ?? 0) + 1);
  }

  const data: { date: string; count: number; level: number }[] = [];
  const current = new Date(yearAgo);
  while (current <= today) {
    const dateStr = format(current, 'yyyy-MM-dd');
    const count = dateMap.get(dateStr) ?? 0;
    data.push({ date: dateStr, count, level: count > 0 ? 4 : 0 });
    current.setDate(current.getDate() + 1);
  }

  return (
    <div className="overflow-x-auto">
      <ActivityCalendar
        data={data}
        colorScheme={theme}
        theme={{
          light: ['#f3f4f6', color],
          dark: ['#374151', color],
        }}
        blockSize={12}
        blockMargin={3}
        fontSize={12}
        showWeekdayLabels
      />
    </div>
  );
}
