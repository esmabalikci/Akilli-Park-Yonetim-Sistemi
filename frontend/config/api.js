import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Geliştirme için API kökü:
 * - EXPO_PUBLIC_API_URL tanımlıysa onu kullanın (fiziksel cihaz / farklı port).
 * - Expo Go: Metro bilgisayarının IP’si (debuggerHost / hostUri) ile 3000 portu.
 * - Android emülatör: 10.0.2.2
 * - iOS simülatör: 
 */
export function getApiBaseUrl() {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv && typeof fromEnv === 'string') {
    return fromEnv.replace(/\/$/, '');
  }

  const debuggerHost =
    Constants.expoGoConfig?.debuggerHost?.split(':')[0] ||
    Constants.expoConfig?.hostUri?.split(':')[0] ||
    Constants.manifest?.debuggerHost?.split(':')[0];

  if (
    debuggerHost &&
    debuggerHost !== '127.0.0.1' &&
    !/^$/i.test(debuggerHost)
  ) {
    return `http://${debuggerHost}:3000`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }
  return 'http://localhost:3000';
}
