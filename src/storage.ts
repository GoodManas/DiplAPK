import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'dp_auth_token';

export async function loadStoredToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function saveStoredToken(token: string) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearStoredToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}
