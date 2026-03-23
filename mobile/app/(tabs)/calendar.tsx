import { useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useHabits, useTodayCompletions } from '../../src/hooks/useHabits';
import { useLogs, useMonthLogEntries } from '../../src/hooks/useLogs';
import { useMonthCompletions } from '../../src/hooks/useMonthCompletions';
import { MonthGrid } from '../../src/components/calendar/MonthGrid';
import { DayDetail } from '../../src/components/calendar/DayDetail';
import { useSettings } from '../../src/context/SettingsContext';
import { useTheme } from '../../src/context/ThemeContext';
import { habitsApi } from '../../src/api/habits';
import { queryKeys } from '../../src/lib/queryKeys';
import { useQueryClient } from '@tanstack/react-query';

type Mode = 'habits' | 'logs';

export default function CalendarScreen() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('habits');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { weekStartsOn } = useSettings();
  const { isDark } = useTheme();
  const { habits } = useHabits();
  const { logs } = useLogs();
  const { completions, loading } = useMonthCompletions(currentMonth);
  const { entries: monthLogEntries } = useMonthLogEntries(currentMonth);
  const queryClient = useQueryClient();

  const { completions: dayCompletions, setCompletions: setDayCompletions } = useTodayCompletions(
    selectedDate ?? format(new Date(), 'yyyy-MM-dd')
  );

  const color = useMemo(() => {
    if (mode === 'habits' && selectedId)
      return habits.find((h) => h.habitId === selectedId)?.color ?? '#6366f1';
    if (mode === 'logs' && selectedId)
      return logs.find((l) => l.logId === selectedId)?.color ?? '#6366f1';
    return '#6366f1';
  }, [mode, selectedId, habits, logs]);

  const handleToggle = async (habitId: string, completed: boolean, note?: string) => {
    if (!selectedDate) return;
    if (completed) {
      const optimistic = { habitId, date: selectedDate, completedAt: new Date().toISOString(), note };
      setDayCompletions((prev) => [...prev.filter((c) => c.habitId !== habitId), optimistic]);
      try {
        const result = await habitsApi.complete(habitId, selectedDate, note || undefined);
        queryClient.setQueryData(queryKeys.habits, (prev: typeof habits) =>
          prev.map((h) =>
            h.habitId === habitId
              ? { ...h, currentStreak: result.currentStreak, longestStreak: result.longestStreak }
              : h
          )
        );
        queryClient.invalidateQueries({
          queryKey: queryKeys.completionsRange(
            format(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1), 'yyyy-MM-dd'),
            format(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0), 'yyyy-MM-dd')
          ),
        });
      } catch {
        setDayCompletions((prev) => prev.filter((c) => c.habitId !== habitId));
      }
    } else {
      setDayCompletions((prev) => prev.filter((c) => c.habitId !== habitId));
      try {
        await habitsApi.uncomplete(habitId, selectedDate);
        queryClient.invalidateQueries({
          queryKey: queryKeys.completionsRange(
            format(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1), 'yyyy-MM-dd'),
            format(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0), 'yyyy-MM-dd')
          ),
        });
      } catch {
        const c = dayCompletions.find((c) => c.habitId === habitId);
        if (c) setDayCompletions((prev) => [...prev, c]);
      }
    }
  };

  const filterItems = mode === 'habits' ? habits : logs;

  function handleModeChange(newMode: Mode) {
    setMode(newMode);
    setSelectedId(null);
  }

  const card = isDark ? '#1f2937' : '#fff';
  const textPrimary = isDark ? '#f3f4f6' : '#111827';
  const textSecondary = isDark ? '#9ca3af' : '#6b7280';

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: isDark ? '#111827' : '#f9fafb' }]}
      edges={['top']}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Month nav */}
        <View style={styles.monthNav}>
          <Pressable
            onPress={() => { setCurrentMonth((m) => subMonths(m, 1)); setSelectedDate(null); }}
            style={styles.navButton}
            hitSlop={8}
          >
            <ChevronLeft size={22} color="#6366f1" />
          </Pressable>
          <Text style={[styles.monthTitle, { color: textPrimary }]}>
            {format(currentMonth, 'MMMM yyyy')}
          </Text>
          <Pressable
            onPress={() => { setCurrentMonth((m) => addMonths(m, 1)); setSelectedDate(null); }}
            style={styles.navButton}
            hitSlop={8}
          >
            <ChevronRight size={22} color="#6366f1" />
          </Pressable>
        </View>

        {/* Grid */}
        {loading ? (
          <ActivityIndicator color="#6366f1" style={styles.loader} />
        ) : (
          <View style={[styles.gridCard, { backgroundColor: card }]}>
            <MonthGrid
              month={currentMonth}
              completions={completions}
              totalHabits={habits.length}
              logEntries={monthLogEntries}
              totalLogs={logs.length}
              mode={mode}
              selectedId={selectedId}
              color={color}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              weekStartsOn={weekStartsOn}
            />
          </View>
        )}

        {/* Filter panel */}
        <View style={[styles.filterCard, { backgroundColor: card }]}>
          <Text style={[styles.filterLabel, { color: textSecondary }]}>CATEGORY</Text>
          <View style={styles.categoryRow}>
            {(['habits', 'logs'] as Mode[]).map((m) => (
              <Pressable
                key={m}
                onPress={() => handleModeChange(m)}
                style={[
                  styles.categoryButton,
                  mode === m
                    ? { backgroundColor: isDark ? '#312e81' : '#eef2ff', borderColor: '#6366f1' }
                    : { backgroundColor: isDark ? '#374151' : '#f3f4f6', borderColor: 'transparent' },
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    { color: mode === m ? '#6366f1' : textSecondary },
                  ]}
                >
                  {m === 'habits' ? 'Habits' : 'Logs'}
                </Text>
              </Pressable>
            ))}
          </View>

          {filterItems.length > 0 && (
            <>
              <Text style={[styles.filterLabel, { color: textSecondary, marginTop: 12 }]}>
                {mode === 'habits' ? 'HABIT' : 'LOG'}
              </Text>
              <View style={styles.itemList}>
                <Pressable
                  onPress={() => setSelectedId(null)}
                  style={[
                    styles.itemButton,
                    selectedId === null && { backgroundColor: isDark ? '#312e81' : '#eef2ff' },
                  ]}
                >
                  <Text style={[styles.itemText, { color: selectedId === null ? '#6366f1' : textSecondary }]}>
                    All
                  </Text>
                </Pressable>
                {filterItems.map((item) => {
                  const id = mode === 'habits'
                    ? (item as typeof habits[0]).habitId
                    : (item as typeof logs[0]).logId;
                  const isActive = selectedId === id;
                  return (
                    <Pressable
                      key={id}
                      onPress={() => setSelectedId(id)}
                      style={[
                        styles.itemButton,
                        isActive && { backgroundColor: isDark ? '#312e81' : '#eef2ff' },
                      ]}
                    >
                      <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                      <Text style={[styles.itemText, { color: isActive ? '#6366f1' : textSecondary }]}>
                        {item.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}
        </View>

        {/* Day detail */}
        {selectedDate && (
          <DayDetail
            date={selectedDate}
            habits={habits}
            completions={dayCompletions}
            logs={logs}
            onToggle={handleToggle}
          />
        )}

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16 },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navButton: { padding: 8 },
  monthTitle: { fontSize: 18, fontWeight: '700' },
  loader: { marginVertical: 32 },
  gridCard: {
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  filterCard: { borderRadius: 12, padding: 16 },
  filterLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, marginBottom: 8 },
  categoryRow: { flexDirection: 'row', gap: 8 },
  categoryButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  categoryText: { fontSize: 14, fontWeight: '500' },
  itemList: { gap: 2 },
  itemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  colorDot: { width: 8, height: 8, borderRadius: 4 },
  itemText: { fontSize: 13, fontWeight: '500' },
  spacer: { height: 24 },
});
