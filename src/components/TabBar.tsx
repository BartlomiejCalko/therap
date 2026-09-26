import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { useT, type Dict } from '@/i18n';
import { tap } from '@/lib/haptics';
import { useTheme } from '@/theme/theme';

import { Icon, type IconName } from './Icon';

const FADE_TOP = 36;
const PILL_HEIGHT = 62;
// The gradient ends halfway down the pill; below that the backdrop is solid.
const FADE_HEIGHT = FADE_TOP + PILL_HEIGHT / 2;

const ICONS: Record<string, { icon: IconName; label: keyof Dict['tabs'] }> = {
  index: { icon: 'today', label: 'today' },
  capture: { icon: 'capture', label: 'capture' },
  unload: { icon: 'unload', label: 'unload' },
  breath: { icon: 'breath', label: 'breath' },
  calendar: { icon: 'calendar', label: 'calendar' },
};

// Cosmos-style floating pill. The middle action (Unload) is the one ink circle.
export function TabBar({ state, navigation, insets }: BottomTabBarProps) {
  const { c } = useTheme();
  const t = useT();
  const { width } = useWindowDimensions();
  return (
    <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) + 6 }]}>
      {/* Explicit sizes: percentage sizes on an absolutely filled Svg came out short on iOS,
          letting scrolled content show below the pill. */}
      <Svg pointerEvents="none" style={styles.fade} width={width} height={FADE_HEIGHT}>
        <Defs>
          <LinearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={c.bg} stopOpacity={0} />
            <Stop offset="0.6" stopColor={c.bg} stopOpacity={0.92} />
            <Stop offset="1" stopColor={c.bg} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={FADE_HEIGHT} fill="url(#fade)" />
      </Svg>
      <View pointerEvents="none" style={[styles.solid, { backgroundColor: c.bg }]} />
      <View style={[styles.pill, { backgroundColor: c.surface, shadowColor: c.shadow, borderColor: c.hairline }]}>
        {state.routes.map((route, index) => {
          const meta = ICONS[route.name];
          if (!meta) return null;
          const focused = state.index === index;
          const center = route.name === 'unload';
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityLabel={t.tabs[meta.label]}
              accessibilityState={{ selected: focused }}
              onPress={() => {
                tap();
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
              }}
              style={styles.item}>
              {center ? (
                <View style={[styles.center, { backgroundColor: c.ink }]}>
                  <Icon name={meta.icon} size={21} color={c.onInk} />
                </View>
              ) : (
                <>
                  <Icon name={meta.icon} size={22} color={focused ? c.ink : c.inkFaint} />
                  <View style={[styles.dot, { backgroundColor: focused ? c.ink : 'transparent' }]} />
                </>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingTop: FADE_TOP,
  },
  fade: { position: 'absolute', top: 0, left: 0 },
  solid: { position: 'absolute', top: FADE_HEIGHT, left: 0, right: 0, bottom: 0 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: PILL_HEIGHT,
    borderRadius: PILL_HEIGHT / 2,
    paddingHorizontal: 8,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  item: { width: 54, height: 54, alignItems: 'center', justifyContent: 'center' },
  center: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 3, height: 3, borderRadius: 1.5, marginTop: 5 },
});
