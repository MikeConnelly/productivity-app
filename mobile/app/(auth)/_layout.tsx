import { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { getCurrentUser } from 'aws-amplify/auth';

export default function AuthLayout() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    getCurrentUser()
      .then(() => {
        router.replace('/(tabs)');
      })
      .catch(() => {
        setChecked(true);
      });
  }, []);

  if (!checked) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}
