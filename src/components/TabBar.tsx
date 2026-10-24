import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
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
import { fonts } from '@/theme/tokens';

import { Glyph } from './Glyph';
import { Icon, type IconName } from './Icon';

const BAR_HEIGHT = 58;
const SIDE = 6;
const LENS_HEIGHT = 50;

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

// A glass bar docked to the bottom edge, each icon named underneath.
// Content still scrolls behind it, softened by the glass.
export function TabBar({ state, emitter, navigateToTab, insets }: BottomTabBarProps) {
  const { c, scheme } = useTheme();
  const t = useT();
  const reduced = useReducedMotion();
  const { width } = useWindowDimensions();
  const count = state.routes.filter((r) => ICONS[r.name]).length || 1;
  const itemWidth = (width - SIDE * 2) / count;
  const lensWidth = Math.min(itemWidth - 6, 84);
  const lensX = (index: number) => SIDE + index * itemWidth + (itemWidth - lensWidth) / 2;

  const x = useSharedValue(lensX(state.index));
  useEffect(() => {
    x.value = reduced ? lensX(state.index) : withSpring(lensX(state.index), GLIDE);
    // lensX only changes with the window width, which `itemWidth` already tracks.
  }, [state.index, reduced, itemWidth, x]);
  const lens = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  const bottom = Math.max(insets.bottom, 8);

  const content = (
    <>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.lens,
          { width: lensWidth, backgroundColor: scheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(43,36,56,0.06)' },
          lens,
        ]}
      />
      <View style={styles.row}>
        {state.routes.map((route, index) => {
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
                const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (state.index !== index && !event.defaultPrevented) navigateToTab(route.key);
              }}
            />
          );
        })}
      </View>
    </>
  );

  return (
    <View style={[styles.wrap, { height: BAR_HEIGHT + bottom }]}>
      {LIQUID ? (
        <GlassView glassEffectStyle="regular" colorScheme={scheme} style={[StyleSheet.absoluteFill, { paddingBottom: bottom }]}>
          {content}
        </GlassView>
      ) : (
        <View style={[StyleSheet.absoluteFill, { paddingBottom: bottom }]}>
          <BlurView
            intensity={45}
            tint={scheme === 'dark' ? 'dark' : 'light'}
            experimentalBlurMethod="dimezisBlurView"
            style={StyleSheet.absoluteFill}
          />
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: scheme === 'dark' ? 'rgba(13,10,24,0.74)' : 'rgba(247,241,245,0.76)' },
            ]}
          />
          {content}
        </View>
      )}
      <View pointerEvents="none" style={[styles.edge, { backgroundColor: c.hairline }]} />
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
      press.value = 1.1;
      press.value = withSpring(1, PRESS);
    }
  }, [focused, reduced, on, press]);

  const scale = useAnimatedStyle(() => ({ transform: [{ scale: press.value }] }));
  const activeLayer = useAnimatedStyle(() => ({ opacity: on.value }));
  const idleLayer = useAnimatedStyle(() => ({ opacity: 1 - on.value }));

  // The session tab carries the sunrise drawing, cropped to the sun and horizon.
  const glyph = (color: string) =>
    center ? (
      <Glyph name="sunrise" size={30} crop={[8, 22, 48, 34]} weight={1.5} color={color} />
    ) : (
      <Icon name={icon} size={22} color={color} />
    );

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: focused }}
      onPress={onPress}
      onPressIn={() => {
        if (!reduced) press.value = withSpring(0.88, PRESS);
      }}
      onPressOut={() => {
        if (!reduced) press.value = withSpring(1, PRESS);
      }}
      style={styles.item}>
      <Animated.View style={[styles.itemInner, scale]}>
        {/* Two layers, crossfaded, so icon and name ease from faint to ink. */}
        <View>
          <Animated.View style={[styles.stack, idleLayer]}>
            {glyph(c.inkFaint)}
            <Animated.Text numberOfLines={1} style={[styles.label, { color: c.inkFaint }]}>
              {label}
            </Animated.Text>
          </Animated.View>
          <Animated.View style={[StyleSheet.absoluteFill, styles.stack, activeLayer]}>
            {glyph(center ? c.gold : c.ink)}
            <Animated.Text numberOfLines={1} style={[styles.label, { color: c.ink }]}>
              {label}
            </Animated.Text>
          </Animated.View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  edge: { position: 'absolute', left: 0, right: 0, top: 0, height: StyleSheet.hairlineWidth },
  row: { flexDirection: 'row', height: BAR_HEIGHT, paddingHorizontal: SIDE },
  lens: {
    position: 'absolute',
    left: 0,
    top: (BAR_HEIGHT - LENS_HEIGHT) / 2,
    height: LENS_HEIGHT,
    borderRadius: 16,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  itemInner: { alignItems: 'center', justifyContent: 'center' },
  stack: { alignItems: 'center', justifyContent: 'flex-end' },
  label: { fontFamily: fonts.sansMedium, fontSize: 10.5, lineHeight: 13, marginTop: 4, letterSpacing: 0.1 },
});
