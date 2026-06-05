import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { storage } from './storage';
import axios from 'axios';

const API_URL = 'https://kickguild.zeninhost.xyz/api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('Push not supported on emulator');
    return null;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push permission not granted');
    return null;
  }

  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenData.data;

    // Send token to backend
    const storedToken = await storage.getToken();
    if (storedToken) {
      await axios.post(
        `${API_URL}/push/register`,
        { token, platform: Platform.OS },
        { headers: { Authorization: `Bearer ${storedToken}`, Accept: 'application/json' } }
      );
    }

    // Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Notificações',
        importance: Notifications.AndroidImportance.MAX,
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
  try {
    const token = await storage.getToken();
    if (!token) return;

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });

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
  // Handle notification tapped (app opened from notification)
  const subTap = Notifications.addNotificationResponseReceivedListener(response => {
    const data = response.notification.request.content.data;
    handleTap(data);
  });

  return subTap;
}