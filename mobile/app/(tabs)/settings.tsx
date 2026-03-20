import { View, Text, Switch, Pressable, Alert, ScrollView } from 'react-native';
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
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Settings</Text>

        {/* Appearance */}
        <Text className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
          Appearance
        </Text>
        <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm mb-6 overflow-hidden">
          <View className="flex-row items-center px-4 py-3.5">
            {isDark ? (
              <Moon size={20} color="#6366f1" />
            ) : (
              <Sun size={20} color="#6366f1" />
            )}
            <Text className="flex-1 ml-3 text-base text-gray-900 dark:text-gray-100">
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
        <Text className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
          Calendar
        </Text>
        <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm mb-6 overflow-hidden">
          <View className="px-4 py-3.5">
            <Text className="text-base text-gray-900 dark:text-gray-100 mb-3">Week starts on</Text>
            <View className="flex-row gap-2">
              {(['Sunday', 'Monday'] as const).map((label, i) => (
                <Pressable
                  key={label}
                  onPress={() => setWeekStartsOn(i as 0 | 1)}
                  className="flex-1 py-2 rounded-xl items-center"
                  style={{
                    backgroundColor: weekStartsOn === i ? '#6366f1' : '#f3f4f6',
                  }}
                >
                  <Text
                    className="text-sm font-medium"
                    style={{ color: weekStartsOn === i ? '#fff' : '#6b7280' }}
                  >
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Account */}
        <Text className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
          Account
        </Text>
        <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
          <Pressable
            onPress={handleSignOut}
            className="flex-row items-center px-4 py-3.5"
          >
            <LogOut size={20} color="#ef4444" />
            <Text className="ml-3 text-base text-red-500 font-medium">Sign Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
