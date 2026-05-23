import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'dp_auth_token';
const TOKEN_FOR_SERVER_KEY = 'dp_auth_token_server';
const SERVER_URL_KEY = 'dp_server_url';

export async function loadStoredToken(serverUrl: string | null) {
  if (!serverUrl) return null;
  const [[, token], [, boundServer]] = await AsyncStorage.multiGet([
    TOKEN_KEY,
    TOKEN_FOR_SERVER_KEY,
  ]);
  if (!token || boundServer !== serverUrl) {
    if (token) await clearStoredToken();
    return null;
  }
  return token;
}

export async function saveStoredToken(token: string, serverUrl: string) {
  await AsyncStorage.multiSet([
    [TOKEN_KEY, token],
    [TOKEN_FOR_SERVER_KEY, serverUrl],
  ]);
}

export async function clearStoredToken() {
  await AsyncStorage.multiRemove([TOKEN_KEY, TOKEN_FOR_SERVER_KEY]);
}

export async function loadStoredServerUrl() {
  return AsyncStorage.getItem(SERVER_URL_KEY);
}

export async function saveStoredServerUrl(url: string) {
  await AsyncStorage.setItem(SERVER_URL_KEY, url);
}

export async function clearStoredServerUrl() {
  await AsyncStorage.removeItem(SERVER_URL_KEY);
}
