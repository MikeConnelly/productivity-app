import { useState } from 'react';
import { X } from 'lucide-react';
import type { Habit } from '../../api/habits';

interface NoteModalProps {
  habit: Habit;
  existingNote?: string;
  isCompleted: boolean;
  onSave: (note: string) => void;
  onClose: () => void;
}

export function NoteModal({ habit, existingNote, isCompleted, onSave, onClose }: NoteModalProps) {
  const [note, setNote] = useState(existingNote ?? '');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            {habit.icon} {habit.name}
          </h3>
          <button onClick={onClose} className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={20} />
          </button>
        </div>
        <textarea
          className="w-full h-32 p-3 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Add a note about today's completion..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          autoFocus
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(note)}
            className="flex-1 py-2.5 text-white rounded-lg text-sm font-medium hover:opacity-90"
            style={{ backgroundColor: habit.color }}
          >
            {isCompleted ? 'Update Note' : 'Complete & Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
