import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { signIn } from 'aws-amplify/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username.trim() || !password) return;
    setLoading(true);
    setError('');
    try {
      await signIn({ username: username.trim(), password });
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.message ?? 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50 dark:bg-gray-900"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="items-center mb-10">
          <Text className="text-4xl mb-2">✅</Text>
          <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Productivity App
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Sign in to continue
          </Text>
        </View>

        {/* Card */}
        <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          {error ? (
            <View className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 mb-4">
              <Text className="text-sm text-red-600 dark:text-red-400">{error}</Text>
            </View>
          ) : null}

          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Username
          </Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Enter username"
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
            autoCorrect={false}
            className="bg-gray-100 dark:bg-gray-700 rounded-xl p-3 text-gray-900 dark:text-gray-100 mb-4"
            returnKeyType="next"
          />

          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
          </Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            className="bg-gray-100 dark:bg-gray-700 rounded-xl p-3 text-gray-900 dark:text-gray-100 mb-6"
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          <Pressable
            onPress={handleLogin}
            disabled={loading || !username.trim() || !password}
            className="py-3.5 rounded-xl items-center bg-indigo-500"
            style={{ opacity: loading || !username.trim() || !password ? 0.6 : 1 }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-base font-semibold text-white">Sign In</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
