import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  TOKEN: '@kickguild:token',
  USER: '@kickguild:user',
};

export const storage = {
  getToken: () => AsyncStorage.getItem(KEYS.TOKEN),
  setToken: (token: string) => AsyncStorage.setItem(KEYS.TOKEN, token),
  removeToken: () => AsyncStorage.removeItem(KEYS.TOKEN),

  getUser: async () => {
    const data = await AsyncStorage.getItem(KEYS.USER);
    return data ? JSON.parse(data) : null;
  },
  setUser: (user: any) => AsyncStorage.setItem(KEYS.USER, JSON.stringify(user)),
  removeUser: () => AsyncStorage.removeItem(KEYS.USER),

  clear: () => AsyncStorage.multiRemove([KEYS.TOKEN, KEYS.USER]),
};