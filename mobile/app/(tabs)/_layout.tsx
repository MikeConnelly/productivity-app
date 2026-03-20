import { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { AppState } from 'react-native';
import { getCurrentUser } from 'aws-amplify/auth';
import { useQueryClient } from '@tanstack/react-query';
import { CalendarDays, CheckSquare, Settings } from 'lucide-react-native';

export default function TabsLayout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Auth guard
  useEffect(() => {
    getCurrentUser().catch(() => router.replace('/(auth)/login'));
  }, []);

  // Refetch on app foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        queryClient.invalidateQueries();
      }
    });
    return () => sub.remove();
  }, [queryClient]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          borderTopColor: '#e5e7eb',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, size }) => <CheckSquare size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, size }) => <CalendarDays size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
