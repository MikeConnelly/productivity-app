import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import type { Habit } from '../../api/habits';

interface NoteModalProps {
  habit: Habit;
  existingNote?: string;
  isCompleted: boolean;
  onSave: (note: string) => void;
  onClose: () => void;
}

export function NoteModal({ habit, existingNote, isCompleted, onSave, onClose }: NoteModalProps) {
  const { isDark } = useTheme();
  const [note, setNote] = useState(existingNote ?? '');

  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Pressable style={styles.backdrop} onPress={onClose}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={[styles.card, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}>
              <View style={styles.cardHeader}>
                <View style={styles.habitLabel}>
                  <Text style={styles.habitIcon}>{habit.icon}</Text>
                  <Text
                    style={[styles.habitName, { color: isDark ? '#f3f4f6' : '#111827' }]}
                    numberOfLines={1}
                  >
                    {habit.name}
                  </Text>
                </View>
                <Pressable onPress={onClose} hitSlop={8}>
                  <X size={20} color="#9ca3af" />
                </Pressable>
              </View>

              <TextInput
                style={[
                  styles.noteInput,
                  { backgroundColor: isDark ? '#374151' : '#f3f4f6', color: isDark ? '#f3f4f6' : '#111827' },
                ]}
                placeholder="Add a note…"
                placeholderTextColor="#9ca3af"
                value={note}
                onChangeText={setNote}
                multiline
                autoFocus
                textAlignVertical="top"
              />

              <View style={styles.buttonRow}>
                <Pressable
                  onPress={onClose}
                  style={[styles.cancelButton, { backgroundColor: isDark ? '#374151' : '#f3f4f6' }]}
                >
                  <Text style={[styles.cancelText, { color: isDark ? '#d1d5db' : '#4b5563' }]}>
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => onSave(note.trim())}
                  style={[styles.saveButton, { backgroundColor: habit.color }]}
                >
                  <Text style={styles.saveText}>
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

const styles = StyleSheet.create({
  keyboardView: { flex: 1 },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  habitLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  habitIcon: { fontSize: 20 },
  habitName: { fontSize: 16, fontWeight: '600', maxWidth: 220 },
  noteInput: {
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    fontSize: 14,
  },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  cancelButton: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  cancelText: { fontSize: 14, fontWeight: '500' },
  saveButton: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  saveText: { fontSize: 14, fontWeight: '600', color: '#fff' },
});
