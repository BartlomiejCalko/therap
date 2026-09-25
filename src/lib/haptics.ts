import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Haptics are a quiet extra — never let them throw on platforms without support.
const run = (fn: () => Promise<void>) => {
  if (Platform.OS === 'web') return;
  fn().catch(() => {});
};

export const tap = () => run(() => Haptics.selectionAsync());
export const soft = () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft));
export const done = () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
