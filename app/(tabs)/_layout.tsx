import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { notificationsApi, setApiToken } from '../../lib/api';
import { storage } from '../../lib/storage';

function NotificationIcon({ color }: { color: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const token = await storage.getToken();
        if (!token) return;
        setApiToken(token);
        const { data } = await notificationsApi.unreadCount();
        if (mounted) setCount(data.unread_count || 0);
      } catch (_) {}
    };
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  return (
    <View>
      <Text style={{ fontSize: 20 }}>🔔</Text>
      {count > 0 && (
        <View style={{
          position: 'absolute', top: -4, right: -8,
          backgroundColor: '#ef4444', borderRadius: 9,
          minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center',
          paddingHorizontal: 4,
        }}>
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{count > 9 ? '9+' : count}</Text>
        </View>
      )}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4f46e5',
        tabBarStyle: { height: 60, paddingBottom: 8 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Busca',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🔍</Text>,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Postar',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>✏️</Text>,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notificações',
          tabBarIcon: ({ color }) => <NotificationIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}