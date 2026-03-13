interface DayCellProps {
  date: string;
  completionCount: number;
  totalHabits: number;
  isSelected: boolean;
  isToday: boolean;
  onClick: () => void;
}

function getHeatmapColor(completionCount: number, totalHabits: number): string {
  if (totalHabits === 0 || completionCount === 0) return 'bg-gray-100';
  const ratio = completionCount / totalHabits;
  if (ratio <= 0.33) return 'bg-indigo-100';
  if (ratio <= 0.66) return 'bg-indigo-300';
  if (ratio < 1) return 'bg-indigo-500';
  return 'bg-indigo-700';
}

export function DayCell({ date, completionCount, totalHabits, isSelected, isToday, onClick }: DayCellProps) {
  const day = new Date(date + 'T00:00:00').getDate();
  const heatmap = getHeatmapColor(completionCount, totalHabits);

  return (
    <button
      onClick={onClick}
      className={`
        aspect-square flex items-center justify-center rounded-lg text-sm transition-all
        ${heatmap}
        ${isSelected ? 'ring-2 ring-indigo-600 ring-offset-1' : ''}
        ${completionCount > 0 ? 'text-white' : 'text-gray-700'}
        hover:opacity-80
      `}
    >
      <span className={isToday ? 'font-bold' : ''}>{day}</span>
    </button>
  );
}
