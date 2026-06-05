import { Stack, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { storage } from '../lib/storage';
import { setApiToken } from '../lib/api';
import { registerForPushNotifications, setupNotificationListeners } from '../lib/push';

export default function RootLayout() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await storage.getToken();
        if (token) {
          setApiToken(token);
          await registerForPushNotifications();

          const sub = setupNotificationListeners((data) => {
            if (data?.type === 'follow' && data?.actor_id) {
              router.push({ pathname: '/user/[username]', params: { username: data.actor_name || '' } });
            } else if ((data?.type === 'like' || data?.type === 'reply') && data?.post_uuid) {
              router.push({ pathname: '/post/[uuid]', params: { uuid: data.post_uuid } });
            } else {
              router.replace('/(tabs)');
            }
          });

          router.replace('/(tabs)');
          return () => sub?.remove();
        } else {
          router.replace('/(auth)/login');
        }
      } catch (e) {
        console.error('RootLayout error:', e);
        router.replace('/(auth)/login');
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
    <Stack screenOptions={{ headerShown: false }} />
  );
}