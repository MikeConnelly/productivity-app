import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X } from 'lucide-react-native';
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
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <Pressable className="flex-1 bg-black/50 justify-center px-4" onPress={onClose}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-2">
                  <Text className="text-xl">{habit.icon}</Text>
                  <Text
                    className="text-base font-semibold text-gray-900 dark:text-gray-100"
                    numberOfLines={1}
                    style={{ maxWidth: 220 }}
                  >
                    {habit.name}
                  </Text>
                </View>
                <Pressable onPress={onClose} hitSlop={8}>
                  <X size={20} color="#9ca3af" />
                </Pressable>
              </View>

              <TextInput
                className="bg-gray-100 dark:bg-gray-700 rounded-xl p-3 text-gray-900 dark:text-gray-100 min-h-[80px]"
                placeholder="Add a note…"
                placeholderTextColor="#9ca3af"
                value={note}
                onChangeText={setNote}
                multiline
                autoFocus
                textAlignVertical="top"
              />

              <View className="flex-row gap-3 mt-4">
                <Pressable
                  onPress={onClose}
                  className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 items-center"
                >
                  <Text className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => onSave(note.trim())}
                  className="flex-1 py-3 rounded-xl items-center"
                  style={{ backgroundColor: habit.color }}
                >
                  <Text className="text-sm font-semibold text-white">
                    {isCompleted ? 'Update Note' : 'Complete & Save'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
