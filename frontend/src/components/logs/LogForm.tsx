import { useState, useRef } from 'react';
import { X } from 'lucide-react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import type { Log } from '../../api/logs';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#06b6d4'];

interface LogFormProps {
  log?: Log;
  onSave: (data: { name: string; color: string; icon: string }) => Promise<void>;
  onClose: () => void;
}

export function LogForm({ log, onSave, onClose }: LogFormProps) {
  const [name, setName] = useState(log?.name ?? '');
  const [color, setColor] = useState(log?.color ?? '#6366f1');
  const [icon, setIcon] = useState(log?.icon ?? '📋');
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({ name: name.trim(), color, icon });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
            {log ? 'Edit Log' : 'New Log'}
          </h3>
          <button onClick={onClose} className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. What I ate today"
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Icon</label>
            <button
              type="button"
              onClick={() => setPickerOpen((o) => !o)}
              className="w-12 h-12 text-2xl rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-indigo-400 flex items-center justify-center transition-colors"
            >
              {icon}
            </button>
            {pickerOpen && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" ref={pickerRef}>
                <div className="absolute inset-0 bg-black/30" onClick={() => setPickerOpen(false)} />
                <div className="relative">
                  <Picker
                    data={data}
                    onEmojiSelect={(e: { native: string }) => {
                      setIcon(e.native);
                      setPickerOpen(false);
                    }}
                    theme="auto"
                    previewPosition="none"
                    skinTonePosition="none"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                    color === c ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : log ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
