import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useT, type Dict } from '@/i18n';
import { tap } from '@/lib/haptics';
import { useTheme } from '@/theme/theme';

import { Icon, type IconName } from './Icon';

const ITEM = 54;
const PAD = 8;
const PILL_HEIGHT = 62;
const LENS_WIDTH = 50;
const LENS_HEIGHT = 46;

// Soft and slightly underdamped: the lens glides and settles like the system tab bar.
const GLIDE = { damping: 17, stiffness: 190, mass: 0.9 };
const PRESS = { damping: 14, stiffness: 320 };

// Real Liquid Glass needs iOS 26; elsewhere a frosted blur stands in.
const LIQUID = isLiquidGlassAvailable();

const ICONS: Record<string, { icon: IconName; label: keyof Dict['tabs'] }> = {
  index: { icon: 'today', label: 'today' },
  capture: { icon: 'capture', label: 'capture' },
  unload: { icon: 'unload', label: 'unload' },
  breath: { icon: 'breath', label: 'breath' },
  calendar: { icon: 'calendar', label: 'calendar' },
};

const lensX = (index: number) => PAD + index * ITEM + (ITEM - LENS_WIDTH) / 2;

// Cosmos-style floating pill in glass, with nothing behind it: content scrolls all the way down.
export function TabBar({ state, navigation, insets }: BottomTabBarProps) {
  const { c, scheme } = useTheme();
  const t = useT();
  const reduced = useReducedMotion();
  const x = useSharedValue(lensX(state.index));

  useEffect(() => {
    x.value = reduced ? lensX(state.index) : withSpring(lensX(state.index), GLIDE);
  }, [state.index, reduced, x]);

  const lens = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  const items = state.routes.map((route, index) => {
    const meta = ICONS[route.name];
    if (!meta) return null;
    return (
      <TabItem
        key={route.key}
        icon={meta.icon}
        label={t.tabs[meta.label]}
        focused={state.index === index}
        center={route.name === 'unload'}
        onPress={() => {
          tap();
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (state.index !== index && !event.defaultPrevented) navigation.navigate(route.name, route.params);
        }}
      />
    );
  });

  const lensView = (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.lens,
        { backgroundColor: scheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(27,26,24,0.07)' },
        lens,
      ]}
    />
  );

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) + 6 }]}>
      {LIQUID ? (
        <GlassView glassEffectStyle="regular" isInteractive colorScheme={scheme} style={styles.pill}>
          {lensView}
          {items}
        </GlassView>
      ) : (
        <View style={[styles.shadow, { shadowColor: c.shadow }]}>
          <View style={[styles.pill, styles.frosted, { borderColor: c.hairline }]}>
            <BlurView
              intensity={40}
              tint={scheme === 'dark' ? 'dark' : 'light'}
              experimentalBlurMethod="dimezisBlurView"
              style={StyleSheet.absoluteFill}
            />
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: scheme === 'dark' ? 'rgba(28,27,25,0.55)' : 'rgba(251,250,247,0.6)' },
              ]}
            />
            {lensView}
            {items}
          </View>
        </View>
      )}
    </View>
  );
}

function TabItem({
  icon,
  label,
  focused,
  center,
  onPress,
}: {
  icon: IconName;
  label: string;
  focused: boolean;
  center: boolean;
  onPress: () => void;
}) {
  const { c } = useTheme();
  const reduced = useReducedMotion();
  const press = useSharedValue(1);
  const on = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    on.value = withTiming(focused ? 1 : 0, { duration: reduced ? 0 : 260 });
    // A small lift when a tab becomes active.
    if (focused && !reduced) {
      press.value = 1.14;
      press.value = withSpring(1, PRESS);
    }
  }, [focused, reduced, on, press]);

  const scale = useAnimatedStyle(() => ({ transform: [{ scale: press.value }] }));
  const activeIcon = useAnimatedStyle(() => ({ opacity: on.value }));
  const idleIcon = useAnimatedStyle(() => ({ opacity: 1 - on.value }));
  const dot = useAnimatedStyle(() => ({ opacity: on.value, transform: [{ scale: 0.4 + on.value * 0.6 }] }));

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: focused }}
      onPress={onPress}
      onPressIn={() => {
        if (!reduced) press.value = withSpring(0.86, PRESS);
      }}
      onPressOut={() => {
        if (!reduced) press.value = withSpring(1, PRESS);
      }}
      style={styles.item}>
      <Animated.View style={[styles.itemInner, scale]}>
        {center ? (
          <View style={[styles.center, { backgroundColor: c.ink }]}>
            <Icon name={icon} size={21} color={c.onInk} />
          </View>
        ) : (
          <>
            <View>
              <Animated.View style={idleIcon}>
                <Icon name={icon} size={22} color={c.inkFaint} />
              </Animated.View>
              <Animated.View style={[StyleSheet.absoluteFill, activeIcon]}>
                <Icon name={icon} size={22} color={c.ink} />
              </Animated.View>
            </View>
            <Animated.View style={[styles.dot, { backgroundColor: c.ink }, dot]} />
          </>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  shadow: {
    borderRadius: PILL_HEIGHT / 2,
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: PILL_HEIGHT,
    borderRadius: PILL_HEIGHT / 2,
    paddingHorizontal: PAD,
    overflow: 'hidden',
  },
  frosted: { borderWidth: StyleSheet.hairlineWidth },
  lens: {
    position: 'absolute',
    left: 0,
    top: (PILL_HEIGHT - LENS_HEIGHT) / 2,
    width: LENS_WIDTH,
    height: LENS_HEIGHT,
    borderRadius: LENS_HEIGHT / 2,
  },
  item: { width: ITEM, height: ITEM, alignItems: 'center', justifyContent: 'center' },
  itemInner: { alignItems: 'center', justifyContent: 'center' },
  center: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 3, height: 3, borderRadius: 1.5, marginTop: 5 },
});
