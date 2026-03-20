import { useState } from 'react';
import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Check, MessageSquare, ChevronRight, Flame } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import type { Habit, Completion } from '../../api/habits';
import { NoteModal } from './NoteModal';

interface HabitCardProps {
  habit: Habit;
  completion?: Completion;
  onToggle: (habitId: string, completed: boolean, note?: string) => void;
}

export function HabitCard({ habit, completion, onToggle }: HabitCardProps) {
  const router = useRouter();
  const { isDark } = useTheme();
  const [showNote, setShowNote] = useState(false);
  const isCompleted = !!completion;

  const handleToggle = () => {
    if (isCompleted && completion?.note) {
      Alert.alert(
        'Remove completion?',
        'This completion has a note attached. Are you sure you want to remove it?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', style: 'destructive', onPress: () => onToggle(habit.habitId, false) },
        ]
      );
      return;
    }
    onToggle(habit.habitId, !isCompleted);
  };

  return (
    <>
      <View
        style={[
          styles.card,
          {
            backgroundColor: isDark ? '#1f2937' : '#fff',
            borderLeftColor: habit.color,
            opacity: isCompleted ? 0.75 : 1,
          },
        ]}
      >
        {/* Checkbox */}
        <Pressable
          onPress={handleToggle}
          style={styles.checkboxHitArea}
          accessibilityLabel={isCompleted ? 'Mark incomplete' : 'Mark complete'}
        >
          <View
            style={[
              styles.checkbox,
              {
                borderColor: isCompleted ? habit.color : '#d1d5db',
                backgroundColor: isCompleted ? habit.color : 'transparent',
              },
            ]}
          >
            {isCompleted && <Check size={14} color="#fff" strokeWidth={3} />}
          </View>
        </Pressable>

        {/* Icon */}
        <Text style={styles.icon}>{habit.icon}</Text>

        {/* Name + streak */}
        <View style={styles.nameContainer}>
          <Text
            style={[
              styles.name,
              {
                color: isCompleted ? '#9ca3af' : (isDark ? '#f3f4f6' : '#111827'),
                textDecorationLine: isCompleted ? 'line-through' : 'none',
              },
            ]}
            numberOfLines={1}
          >
            {habit.name}
          </Text>
          {habit.currentStreak > 0 && !isCompleted && (
            <View style={styles.streakRow}>
              <Flame size={12} color="#f97316" />
              <Text style={styles.streakText}>{habit.currentStreak} day streak</Text>
            </View>
          )}
          {completion?.note && (
            <Text style={[styles.noteText, { color: isDark ? '#6b7280' : '#9ca3af' }]} numberOfLines={1}>
              "{completion.note}"
            </Text>
          )}
        </View>

        {/* Note button */}
        <Pressable
          onPress={() => setShowNote(true)}
          style={[styles.iconButton, { backgroundColor: isDark ? '#374151' : '#f3f4f6' }]}
          accessibilityLabel="Add note"
        >
          <MessageSquare size={18} color="#9ca3af" />
        </Pressable>

        {/* Detail link */}
        <Pressable
          onPress={() => router.push(`/habits/${habit.habitId}`)}
          style={[styles.iconButton, { backgroundColor: isDark ? '#374151' : '#f3f4f6' }]}
          accessibilityLabel="View habit details"
        >
          <ChevronRight size={18} color="#9ca3af" />
        </Pressable>
      </View>

      {showNote && (
        <NoteModal
          habit={habit}
          existingNote={completion?.note}
          isCompleted={isCompleted}
          onSave={(note) => {
            onToggle(habit.habitId, true, note);
            setShowNote(false);
          }}
          onClose={() => setShowNote(false)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  checkboxHitArea: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 20 },
  nameContainer: { flex: 1, minWidth: 0 },
  name: { fontWeight: '500' },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  streakText: { fontSize: 12, color: '#f97316' },
  noteText: { fontSize: 12, marginTop: 2 },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
});
