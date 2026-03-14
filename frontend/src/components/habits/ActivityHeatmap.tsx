import ActivityCalendar from 'react-activity-calendar';
import { useTheme } from '../../context/ThemeContext';

interface ActivityHeatmapProps {
  data: { date: string; count: number; level: number }[];
  color: string;
  loading: boolean;
}

export function ActivityHeatmap({ data, color, loading }: ActivityHeatmapProps) {
  const { theme } = useTheme();

  if (loading) {
    return <div className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded h-28" />;
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
