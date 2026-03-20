import { useRef, useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import BottomSheet, { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import type { Log } from '../../api/logs';

const ICONS = ['📓', '📔', '📒', '📕', '📗', '📘', '🗒️', '📝', '✏️', '🖊️', '💬', '💭', '🧠', '💡', '🔍', '📊'];
const COLORS = ['#6366f1', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#ec4899', '#8b5cf6', '#ef4444'];

interface LogFormProps {
  initial?: Partial<Log>;
  onSave: (data: { name: string; color: string; icon: string }) => Promise<void>;
  onDelete?: () => void;
  onClose: () => void;
}

export function LogForm({ initial, onSave, onDelete, onClose }: LogFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [color, setColor] = useState(initial?.color ?? COLORS[0]);
  const [icon, setIcon] = useState(initial?.icon ?? ICONS[0]);
  const [saving, setSaving] = useState(false);
  const sheetRef = useRef<BottomSheet>(null);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({ name: name.trim(), color, icon });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete log?', 'This will remove all entries. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          onDelete?.();
          onClose();
        },
      },
    ]);
  };

  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={['75%']}
      enablePanDownToClose
      onClose={onClose}
      index={0}
    >
      <BottomSheetScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
          {initial?.logId ? 'Edit Log' : 'New Log'}
        </Text>

        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</Text>
        <BottomSheetTextInput
          value={name}
          onChangeText={setName}
          placeholder="Log name…"
          placeholderTextColor="#9ca3af"
          style={{
            backgroundColor: '#f3f4f6',
            borderRadius: 12,
            padding: 12,
            fontSize: 16,
            color: '#111827',
            marginBottom: 16,
          }}
          autoFocus
          returnKeyType="done"
        />

        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Icon</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {ICONS.map((ic) => (
            <Pressable
              key={ic}
              onPress={() => setIcon(ic)}
              style={{
                width: 44,
                height: 44,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 10,
                borderWidth: 2,
                borderColor: icon === ic ? color : 'transparent',
                backgroundColor: icon === ic ? `${color}20` : '#f3f4f6',
              }}
            >
              <Text style={{ fontSize: 22 }}>{ic}</Text>
            </Pressable>
          ))}
        </View>

        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</Text>
        <View className="flex-row gap-3 mb-6">
          {COLORS.map((c) => (
            <Pressable
              key={c}
              onPress={() => setColor(c)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: c,
                borderWidth: color === c ? 3 : 0,
                borderColor: '#fff',
                shadowColor: color === c ? c : 'transparent',
                shadowOpacity: 0.6,
                shadowRadius: 4,
                elevation: color === c ? 4 : 0,
              }}
            />
          ))}
        </View>

        <Pressable
          onPress={handleSave}
          disabled={saving || !name.trim()}
          className="py-3.5 rounded-xl items-center mb-3"
          style={{ backgroundColor: name.trim() ? color : '#e5e7eb' }}
        >
          <Text className="text-base font-semibold text-white">
            {saving ? 'Saving…' : initial?.logId ? 'Save Changes' : 'Create Log'}
          </Text>
        </Pressable>

        {onDelete && (
          <Pressable
            onPress={handleDelete}
            className="py-3.5 rounded-xl items-center bg-red-50 dark:bg-red-900/20"
          >
            <Text className="text-base font-medium text-red-500">Delete Log</Text>
          </Pressable>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
