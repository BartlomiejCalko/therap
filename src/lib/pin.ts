import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEY = 'unload.pin';

// SecureStore keeps the PIN in the iOS Keychain / Android Keystore.
// The web preview has no secure storage, so it falls back to local storage there.
export async function savePin(pin: string) {
  if (Platform.OS === 'web') return AsyncStorage.setItem(KEY, pin);
  return SecureStore.setItemAsync(KEY, pin);
}

export async function readPin() {
  if (Platform.OS === 'web') return AsyncStorage.getItem(KEY);
  return SecureStore.getItemAsync(KEY);
}

export async function clearPin() {
  if (Platform.OS === 'web') return AsyncStorage.removeItem(KEY);
  return SecureStore.deleteItemAsync(KEY);
}

export async function checkPin(pin: string) {
  return (await readPin()) === pin;
}
