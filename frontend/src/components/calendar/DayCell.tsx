interface DayCellProps {
  date: string;
  level: 0 | 1 | 2 | 3 | 4;
  color: string;
  isSelected: boolean;
  isToday: boolean;
  onClick: () => void;
}

const OPACITY_SUFFIX = ['', '33', '80', 'BF', 'FF'] as const;

export function DayCell({ date, level, color, isSelected, isToday, onClick }: DayCellProps) {
  const day = new Date(date + 'T00:00:00').getDate();

  const inlineStyle: React.CSSProperties = {};
  if (level > 0) inlineStyle.backgroundColor = `${color}${OPACITY_SUFFIX[level]}`;
  if (isSelected) { inlineStyle.outline = `2px solid ${color}`; inlineStyle.outlineOffset = '2px'; }

  const bgClass = level === 0 ? 'bg-gray-100 dark:bg-gray-700' : '';
  const textClass = level >= 3 ? 'text-white' : 'text-gray-700 dark:text-gray-300';

  return (
    <button
      onClick={onClick}
      style={inlineStyle}
      className={`aspect-square flex items-center justify-center rounded-lg text-sm transition-all hover:opacity-80 ${bgClass} ${textClass} ${isToday ? 'ring-2 ring-black dark:ring-white' : ''}`}
    >
      <span className={isToday ? 'font-bold' : ''}>{day}</span>
    </button>
  );
}
