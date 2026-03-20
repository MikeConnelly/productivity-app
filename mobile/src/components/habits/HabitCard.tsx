import { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Check, MessageSquare, ChevronRight, Flame } from 'lucide-react-native';
import type { Habit, Completion } from '../../api/habits';
import { NoteModal } from './NoteModal';

interface HabitCardProps {
  habit: Habit;
  completion?: Completion;
  onToggle: (habitId: string, completed: boolean, note?: string) => void;
}

export function HabitCard({ habit, completion, onToggle }: HabitCardProps) {
  const router = useRouter();
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
        className={`flex-row items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-2 ${isCompleted ? 'opacity-75' : ''}`}
        style={{ borderLeftWidth: 4, borderLeftColor: habit.color }}
      >
        {/* Checkbox */}
        <Pressable
          onPress={handleToggle}
          style={{
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: -8,
          }}
          accessibilityLabel={isCompleted ? 'Mark incomplete' : 'Mark complete'}
        >
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              borderWidth: 2,
              borderColor: isCompleted ? habit.color : '#d1d5db',
              backgroundColor: isCompleted ? habit.color : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isCompleted && <Check size={14} color="#fff" strokeWidth={3} />}
          </View>
        </Pressable>

        {/* Icon */}
        <Text style={{ fontSize: 20 }}>{habit.icon}</Text>

        {/* Name + streak */}
        <View className="flex-1" style={{ minWidth: 0 }}>
          <Text
            className={`font-medium ${isCompleted ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}
            numberOfLines={1}
          >
            {habit.name}
          </Text>
          {habit.currentStreak > 0 && !isCompleted && (
            <View className="flex-row items-center gap-1 mt-0.5">
              <Flame size={12} color="#f97316" />
              <Text className="text-xs text-orange-500">{habit.currentStreak} day streak</Text>
            </View>
          )}
          {completion?.note && (
            <Text className="text-xs text-gray-400 dark:text-gray-500 mt-0.5" numberOfLines={1}>
              "{completion.note}"
            </Text>
          )}
        </View>

        {/* Note button */}
        <Pressable
          onPress={() => setShowNote(true)}
          className="items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg"
          style={{ width: 44, height: 44 }}
          accessibilityLabel="Add note"
        >
          <MessageSquare size={18} color="#9ca3af" />
        </Pressable>

        {/* Detail link */}
        <Pressable
          onPress={() => router.push(`/habits/${habit.habitId}`)}
          className="items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg"
          style={{ width: 44, height: 44 }}
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
