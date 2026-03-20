import { useRef, useState } from 'react';
import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useTheme } from '../../context/ThemeContext';
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
  const { isDark } = useTheme();
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
      <BottomSheetScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: isDark ? '#f3f4f6' : '#111827' }]}>
          {initial?.logId ? 'Edit Log' : 'New Log'}
        </Text>

        <Text style={[styles.label, { color: isDark ? '#d1d5db' : '#374151' }]}>Name</Text>
        <BottomSheetTextInput
          value={name}
          onChangeText={setName}
          placeholder="Log name…"
          placeholderTextColor="#9ca3af"
          style={styles.input}
          autoFocus
          returnKeyType="done"
        />

        <Text style={[styles.label, { color: isDark ? '#d1d5db' : '#374151' }]}>Icon</Text>
        <View style={styles.iconGrid}>
          {ICONS.map((ic) => (
            <Pressable
              key={ic}
              onPress={() => setIcon(ic)}
              style={[
                styles.iconButton,
                {
                  borderColor: icon === ic ? color : 'transparent',
                  backgroundColor: icon === ic ? `${color}20` : '#f3f4f6',
                },
              ]}
            >
              <Text style={styles.iconEmoji}>{ic}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.label, { color: isDark ? '#d1d5db' : '#374151' }]}>Color</Text>
        <View style={styles.colorRow}>
          {COLORS.map((c) => (
            <Pressable
              key={c}
              onPress={() => setColor(c)}
              style={[
                styles.colorDot,
                {
                  backgroundColor: c,
                  borderWidth: color === c ? 3 : 0,
                  borderColor: '#fff',
                  shadowColor: color === c ? c : 'transparent',
                  shadowOpacity: 0.6,
                  shadowRadius: 4,
                  elevation: color === c ? 4 : 0,
                },
              ]}
            />
          ))}
        </View>

        <Pressable
          onPress={handleSave}
          disabled={saving || !name.trim()}
          style={[styles.saveButton, { backgroundColor: name.trim() ? color : '#e5e7eb' }]}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving…' : initial?.logId ? 'Save Changes' : 'Create Log'}
          </Text>
        </Pressable>

        {onDelete && (
          <Pressable
            onPress={handleDelete}
            style={[styles.deleteButton, { backgroundColor: isDark ? 'rgba(239,68,68,0.15)' : '#fef2f2' }]}
          >
            <Text style={styles.deleteButtonText}>Delete Log</Text>
          </Pressable>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    marginBottom: 16,
  },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 2,
  },
  iconEmoji: { fontSize: 22 },
  colorRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  saveButton: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  saveButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  deleteButton: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  deleteButtonText: { fontSize: 16, fontWeight: '500', color: '#ef4444' },
});
