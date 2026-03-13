import { Flame, Trophy } from 'lucide-react';

interface StreakBadgeProps {
  currentStreak: number;
  longestStreak: number;
}

export function StreakBadge({ currentStreak, longestStreak }: StreakBadgeProps) {
  return (
    <div className="flex gap-4">
      <div className="flex items-center gap-2 bg-orange-50 px-4 py-3 rounded-xl">
        <Flame size={20} className="text-orange-500" />
        <div>
          <p className="text-2xl font-bold text-orange-600">{currentStreak}</p>
          <p className="text-xs text-orange-400">Current streak</p>
        </div>
      </div>
      <div className="flex items-center gap-2 bg-yellow-50 px-4 py-3 rounded-xl">
        <Trophy size={20} className="text-yellow-500" />
        <div>
          <p className="text-2xl font-bold text-yellow-600">{longestStreak}</p>
          <p className="text-xs text-yellow-400">Longest streak</p>
        </div>
      </div>
    </div>
  );
}
