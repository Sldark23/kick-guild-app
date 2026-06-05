import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { storage } from '../lib/storage';
import { setApiToken } from '../lib/api';

export default function RootLayout() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = await storage.getToken();
        if (token) {
          setApiToken(token);
          setIsLoggedIn(true);
        }
      } catch (e) {
        console.error('RootLayout error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#4f46e5' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!isLoggedIn ? <Stack.Screen name="(auth)" /> : <Stack.Screen name="(tabs)" />}
    </Stack>
  );
}