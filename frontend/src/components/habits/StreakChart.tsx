import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { Completion } from '../../api/habits';
import { getISOWeek, startOfWeek, subWeeks } from 'date-fns';

interface StreakChartProps {
  history: Completion[];
  color: string;
}

export function StreakChart({ history, color }: StreakChartProps) {
  const today = new Date();
  const weeks: { week: string; count: number }[] = [];

  // Build last 16 weeks
  for (let i = 15; i >= 0; i--) {
    const weekStart = startOfWeek(subWeeks(today, i), { weekStartsOn: 1 });
    const label = `W${getISOWeek(weekStart)}`;
    weeks.push({ week: label, count: 0 });
  }

  // Count completions per week
  for (const c of history) {
    const date = new Date(c.date);
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const weeksAgo = Math.floor((today.getTime() - weekStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
    if (weeksAgo < 16) {
      weeks[15 - weeksAgo].count++;
    }
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={weeks} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <XAxis dataKey="week" tick={{ fontSize: 11 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip
          formatter={(v: number) => [v, 'Completions']}
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
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
