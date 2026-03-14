import { useState } from 'react';
import { MessageSquare, Flame } from 'lucide-react';
import type { Habit, Completion } from '../../api/habits';
import { NoteModal } from './NoteModal';

interface HabitCardProps {
  habit: Habit;
  completion?: Completion;
  onToggle: (habitId: string, completed: boolean, note?: string) => void;
}

export function HabitCard({ habit, completion, onToggle }: HabitCardProps) {
  const [showNoteModal, setShowNoteModal] = useState(false);
  const isCompleted = !!completion;

  return (
    <>
      <div
        className={`flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border-l-4 transition-all ${
          isCompleted ? 'opacity-75' : ''
        }`}
        style={{ borderLeftColor: habit.color }}
      >
        <button
          onClick={() => onToggle(habit.habitId, !isCompleted)}
          className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors min-h-[44px] min-w-[44px] -ml-2`}
          style={{
            borderColor: isCompleted ? habit.color : '#d1d5db',
            backgroundColor: isCompleted ? habit.color : 'transparent',
          }}
          aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
        >
          {isCompleted && (
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <span className="text-xl">{habit.icon}</span>

        <div className="flex-1 min-w-0">
          <p className={`font-medium truncate ${isCompleted ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
            {habit.name}
          </p>
          {habit.currentStreak > 0 && (
            <div className="flex items-center gap-1 text-xs text-orange-500 mt-0.5">
              <Flame size={12} />
              <span>{habit.currentStreak} day streak</span>
            </div>
          )}
          {completion?.note && (
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">"{completion.note}"</p>
          )}
        </div>

        <button
          onClick={() => setShowNoteModal(true)}
          className="flex-shrink-0 p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Add note"
        >
          <MessageSquare size={16} />
        </button>
      </div>

      {showNoteModal && (
        <NoteModal
          habit={habit}
          existingNote={completion?.note}
          isCompleted={isCompleted}
          onSave={(note) => {
            onToggle(habit.habitId, true, note);
            setShowNoteModal(false);
          }}
          onClose={() => setShowNoteModal(false)}
        />
      )}
    </>
  );
}
