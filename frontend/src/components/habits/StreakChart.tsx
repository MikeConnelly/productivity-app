import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { Completion } from '../../api/habits';
import { getISOWeek, startOfWeek, subWeeks } from 'date-fns';
import { useTheme } from '../../context/ThemeContext';

interface StreakChartProps {
  history: Completion[];
  color: string;
}

export function StreakChart({ history, color }: StreakChartProps) {
  const { theme } = useTheme();
  const today = new Date();
  const weeks: { week: string; count: number }[] = [];

  for (let i = 15; i >= 0; i--) {
    const weekStart = startOfWeek(subWeeks(today, i), { weekStartsOn: 1 });
    const label = `W${getISOWeek(weekStart)}`;
    weeks.push({ week: label, count: 0 });
  }

  for (const c of history) {
    const date = new Date(c.date);
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const weeksAgo = Math.floor((today.getTime() - weekStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
    if (weeksAgo < 16) {
      weeks[15 - weeksAgo].count++;
    }
  }

  const isDark = theme === 'dark';
  const tickColor = isDark ? '#9ca3af' : '#6b7280';
  const tooltipBg = isDark ? '#1f2937' : '#ffffff';
  const tooltipBorder = isDark ? '#374151' : '#e5e7eb';
  const tooltipText = isDark ? '#f3f4f6' : '#111827';

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={weeks} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <XAxis dataKey="week" tick={{ fontSize: 11, fill: tickColor }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: tickColor }} />
        <Tooltip
          formatter={(v: number) => [v, 'Completions']}
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            backgroundColor: tooltipBg,
            border: `1px solid ${tooltipBorder}`,
            color: tooltipText,
          }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {weeks.map((_, index) => (
            <Cell key={index} fill={color} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
