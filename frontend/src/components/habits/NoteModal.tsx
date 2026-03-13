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
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">
            {habit.icon} {habit.name}
          </h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <textarea
          className="w-full h-32 p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Add a note about today's completion..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          autoFocus
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(note)}
            className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
            style={{ backgroundColor: habit.color }}
          >
            {isCompleted ? 'Update Note' : 'Complete & Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
