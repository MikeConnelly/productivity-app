import { View, Text, Switch, Pressable, Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { signOut } from 'aws-amplify/auth';
import { Moon, Sun, LogOut } from 'lucide-react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { useSettings } from '../../src/context/SettingsContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const { weekStartsOn, setWeekStartsOn } = useSettings();

  const handleSignOut = () => {
    Alert.alert('Sign out?', 'You will need to sign in again.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#111827' : '#f9fafb' }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.pageTitle, { color: isDark ? '#f3f4f6' : '#111827' }]}>Settings</Text>

        {/* Appearance */}
        <Text style={[styles.sectionLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Appearance</Text>
        <View style={[styles.card, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}>
          <View style={styles.row}>
            {isDark ? (
              <Moon size={20} color="#6366f1" />
            ) : (
              <Sun size={20} color="#6366f1" />
            )}
            <Text style={[styles.rowLabel, { color: isDark ? '#f3f4f6' : '#111827' }]}>
              Dark Mode
            </Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#e5e7eb', true: '#6366f1' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Calendar */}
        <Text style={[styles.sectionLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Calendar</Text>
        <View style={[styles.card, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}>
          <View style={styles.weekStartContainer}>
            <Text style={[styles.rowLabel, { color: isDark ? '#f3f4f6' : '#111827', marginBottom: 12 }]}>
              Week starts on
            </Text>
            <View style={styles.weekStartButtons}>
              {(['Sunday', 'Monday'] as const).map((label, i) => (
                <Pressable
                  key={label}
                  onPress={() => setWeekStartsOn(i as 0 | 1)}
                  style={[
                    styles.weekButton,
                    { backgroundColor: weekStartsOn === i ? '#6366f1' : '#f3f4f6' },
                  ]}
                >
                  <Text
                    style={[styles.weekButtonText, { color: weekStartsOn === i ? '#fff' : '#6b7280' }]}
                  >
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Account */}
        <Text style={[styles.sectionLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Account</Text>
        <View style={[styles.card, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}>
          <Pressable onPress={handleSignOut} style={styles.row}>
            <LogOut size={20} color="#ef4444" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16 },
  pageTitle: { fontSize: 22, fontWeight: '700', marginBottom: 24 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  card: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 24,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  weekStartContainer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  weekStartButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  weekButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  weekButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  signOutText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '500',
  },
});
