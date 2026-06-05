import { Platform } from 'react-native';
import { storage } from './storage';
import axios from 'axios';

const API_URL = 'https://kickguild.zeninhost.xyz/api';
let Notifications: any = null;
let Device: any = null;
let Constants: any = null;

async function ensureModules() {
  if (Notifications) return true;
  try {
    Notifications = await import('expo-notifications');
    Device = await import('expo-device');
    Constants = await import('expo-constants');
    Notifications.default.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
    return true;
  } catch (e) {
    console.log('Push modules not available:', e);
    return false;
  }
}

export async function registerForPushNotifications(): Promise<string | null> {
  const ok = await ensureModules();
  if (!ok) return null;

  if (!Device.default.isDevice) {
    console.log('Push not supported on emulator');
    return null;
  }

  const { status: existing } = await Notifications.default.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.default.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push permission not granted');
    return null;
  }

  try {
    const projectId = Constants.default.expoConfig?.extra?.eas?.projectId;
    const tokenData = await Notifications.default.getExpoPushTokenAsync({ projectId });
    const token = tokenData.data;

    const storedToken = await storage.getToken();
    if (storedToken) {
      await axios.post(
        `${API_URL}/push/register`,
        { token, platform: Platform.OS },
        { headers: { Authorization: `Bearer ${storedToken}`, Accept: 'application/json' } }
      );
    }

    if (Platform.OS === 'android') {
      await Notifications.default.setNotificationChannelAsync('default', {
        name: 'Notificações',
        importance: Notifications.default.AndroidImportance?.MAX || 5,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4f46e5',
      });
    }

    return token;
  } catch (error) {
    console.error('Error registering push token:', error);
    return null;
  }
}

export async function unregisterPushToken(): Promise<void> {
  const ok = await ensureModules();
  if (!ok) return;

  try {
    const token = await storage.getToken();
    if (!token) return;

    const projectId = Constants.default.expoConfig?.extra?.eas?.projectId;
    const tokenData = await Notifications.default.getExpoPushTokenAsync({ projectId });

    await axios.post(
      `${API_URL}/push/unregister`,
      { token: tokenData.data },
      { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
    );
  } catch (error) {
    console.error('Error unregistering push token:', error);
  }
}

export function setupNotificationListeners(handleTap: (data: any) => void) {
  const sub = { remove: () => {} };

  (async () => {
    const ok = await ensureModules();
    if (!ok) return;

    const subTap = Notifications.default.addNotificationResponseReceivedListener((response: any) => {
      const data = response.notification.request.content.data;
      handleTap(data);
    });
    sub.remove = () => subTap.remove();
  })();

  return sub;
}