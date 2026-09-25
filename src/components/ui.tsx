import { useEffect, type ReactNode } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type PressableProps,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { tap } from '@/lib/haptics';
import { useTheme } from '@/theme/theme';
import { radius, space, TAB_BAR_SPACE } from '@/theme/tokens';

import { Icon, type IconName } from './Icon';
import { PaperTexture } from './PaperTexture';
import { T } from './T';

// ---------- Layout ----------

export function Screen({
  children,
  scroll = true,
  withTabBar = false,
  texture = false,
  contentStyle,
  edges = ['top'],
  ...scrollProps
}: {
  children: ReactNode;
  scroll?: boolean;
  withTabBar?: boolean;
  texture?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  edges?: ('top' | 'bottom')[];
} & ScrollViewProps) {
  const { c } = useTheme();
  const bottom = withTabBar ? TAB_BAR_SPACE : space.xl;
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: c.bg }}>
      {texture && <PaperTexture />}
      {scroll ? (
        <ScrollView
          {...scrollProps}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, { paddingBottom: bottom }, contentStyle]}>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, { flex: 1 }, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

export function TopBar({ left, right, center }: { left?: ReactNode; right?: ReactNode; center?: ReactNode }) {
  return (
    <View style={styles.topBar}>
      <View style={styles.topSide}>{left}</View>
      <View style={{ flex: 1, alignItems: 'center' }}>{center}</View>
      <View style={[styles.topSide, { justifyContent: 'flex-end' }]}>{right}</View>
    </View>
  );
}

export function Hairline({ style }: { style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  return <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: c.hairline }, style]} />;
}

export function SectionLabel({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <View style={styles.sectionLabel}>
      <T variant="label">{children}</T>
      {right}
    </View>
  );
}

// ---------- Buttons ----------

export function CircleButton({
  icon,
  onPress,
  size = 40,
  filled = false,
  label,
  color,
}: {
  icon: IconName;
  onPress?: () => void;
  size?: number;
  filled?: boolean;
  label: string;
  color?: string;
}) {
  const { c } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      onPress={() => {
        tap();
        onPress?.();
      }}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: filled ? c.ink : c.surface,
          opacity: pressed ? 0.6 : 1,
        },
      ]}>
      <Icon name={icon} size={size * 0.48} color={color ?? (filled ? c.onInk : c.ink)} />
    </Pressable>
  );
}

export function PillButton({
  title,
  onPress,
  kind = 'primary',
  icon,
  disabled,
  style,
  grow,
}: {
  title: string;
  onPress?: () => void;
  kind?: 'primary' | 'secondary' | 'ghost';
  icon?: IconName;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  grow?: boolean;
}) {
  const { c } = useTheme();
  const primary = kind === 'primary';
  const fg = primary ? c.onInk : c.ink;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={() => {
        tap();
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.pill,
        primary && { backgroundColor: c.ink },
        kind === 'secondary' && { borderWidth: 1, borderColor: c.hairline, backgroundColor: c.surface },
        kind === 'ghost' && { paddingHorizontal: space.md },
        grow && { flex: 1 },
        { opacity: disabled ? 0.35 : pressed ? 0.7 : 1 },
        style,
      ]}>
      <T variant="medium" style={{ color: fg }}>
        {title}
      </T>
      {icon && <Icon name={icon} size={17} color={fg} />}
    </Pressable>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  size = 'md',
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  size?: 'sm' | 'md';
}) {
  const { c } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => {
        tap();
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.chip,
        size === 'sm' && { height: 30, paddingHorizontal: 12 },
        {
          backgroundColor: selected ? c.ink : c.surface,
          borderColor: selected ? c.ink : c.hairline,
          opacity: pressed ? 0.7 : 1,
        },
      ]}>
      <T variant={size === 'sm' ? 'small' : 'body'} style={{ color: selected ? c.onInk : c.ink }}>
        {label}
      </T>
    </Pressable>
  );
}

export function TextLink({ title, onPress, arrow = true }: { title: string; onPress: () => void; arrow?: boolean }) {
  const { c } = useTheme();
  return (
    <Pressable
      accessibilityRole="link"
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [styles.link, { opacity: pressed ? 0.5 : 1 }]}>
      <T variant="medium" style={{ textDecorationLine: 'underline', textDecorationColor: c.hairline }}>
        {title}
      </T>
      {arrow && <Icon name="arrow" size={15} />}
    </Pressable>
  );
}

// ---------- Controls ----------

export function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  const { c } = useTheme();
  const x = useSharedValue(value ? 1 : 0);
  useEffect(() => {
    x.value = withTiming(value ? 1 : 0, { duration: 180 });
  }, [value, x]);
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: x.value * 18 }] }));
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      hitSlop={8}
      onPress={() => {
        tap();
        onChange(!value);
      }}
      style={[
        styles.toggle,
        { backgroundColor: value ? c.ink : c.surfaceAlt, borderColor: value ? c.ink : c.hairline },
      ]}>
      <Animated.View style={[styles.knob, { backgroundColor: value ? c.onInk : c.surface }, knob]} />
    </Pressable>
  );
}

export function Segmented<K extends string>({
  items,
  value,
  onChange,
}: {
  items: { key: K; label: string }[];
  value: K;
  onChange: (key: K) => void;
}) {
  const { c } = useTheme();
  return (
    <View style={[styles.segmented, { backgroundColor: c.surfaceAlt }]}>
      {items.map((item) => {
        const active = item.key === value;
        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => {
              tap();
              onChange(item.key);
            }}
            style={[styles.segment, active && { backgroundColor: c.ink }]}>
            <T variant="small" style={{ color: active ? c.onInk : c.inkSoft, fontFamily: 'Inter_500Medium' }}>
              {item.label}
            </T>
          </Pressable>
        );
      })}
    </View>
  );
}

// A list row in the Blue Bottle / settings style: text left, control or arrow right.
export function Row({
  title,
  detail,
  right,
  onPress,
  last,
}: {
  title: string;
  detail?: string;
  right?: ReactNode;
  onPress?: () => void;
  last?: boolean;
} & Pick<PressableProps, 'onLongPress'>) {
  const { c } = useTheme();
  const content = (
    <View style={styles.row}>
      <View style={{ flex: 1, gap: 2 }}>
        <T variant="body">{title}</T>
        {detail ? (
          <T variant="small" tone="faint">
            {detail}
          </T>
        ) : null}
      </View>
      {right ?? (onPress ? <Icon name="arrow" size={16} color={c.inkFaint} /> : null)}
    </View>
  );
  return (
    <View>
      {onPress ? (
        <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.55 : 1 })}>
          {content}
        </Pressable>
      ) : (
        content
      )}
      {!last && <Hairline />}
    </View>
  );
}

// ---------- Sheet ----------

export function Sheet({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: c.scrim }]} onPress={onClose} />
      <View
        style={[
          styles.sheet,
          { backgroundColor: c.bg, paddingBottom: insets.bottom + space.lg, shadowColor: c.shadow },
        ]}>
        <View style={[styles.handle, { backgroundColor: c.hairline }]} />
        {title ? (
          <T variant="heading" center style={{ marginBottom: space.lg }}>
            {title}
          </T>
        ) : null}
        {children}
      </View>
    </Modal>
  );
}

// ---------- Masonry ----------

// Two columns filled greedily by estimated height, like Cosmos's grid.
export function Masonry<Item>({
  items,
  renderItem,
  estimate,
  gap = 10,
}: {
  items: Item[];
  renderItem: (item: Item) => ReactNode;
  estimate: (item: Item) => number;
  gap?: number;
}) {
  const columns: Item[][] = [[], []];
  const heights = [0, 0];
  for (const item of items) {
    const col = heights[0] <= heights[1] ? 0 : 1;
    columns[col].push(item);
    heights[col] += estimate(item) + gap;
  }
  return (
    <View style={{ flexDirection: 'row', gap }}>
      {columns.map((col, i) => (
        <View key={i} style={{ flex: 1, gap }}>
          {col.map((item) => renderItem(item))}
        </View>
      ))}
    </View>
  );
}

// ---------- Fade in ----------

export function FadeIn({ children, delay = 0, style }: { children: ReactNode; delay?: number; style?: StyleProp<ViewStyle> }) {
  const o = useSharedValue(0);
  useEffect(() => {
    const t = setTimeout(() => {
      o.value = withTiming(1, { duration: 700 });
    }, delay);
    return () => clearTimeout(t);
  }, [delay, o]);
  const animated = useAnimatedStyle(() => ({
    opacity: o.value,
    transform: [{ translateY: (1 - o.value) * 8 }],
  }));
  return <Animated.View style={[animated, style]}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: space.gutter },
  topBar: { flexDirection: 'row', alignItems: 'center', height: 56 },
  topSide: { minWidth: 88, flexDirection: 'row', gap: space.sm },
  sectionLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space.xl,
    marginBottom: space.md,
  },
  pill: {
    height: 50,
    borderRadius: radius.pill,
    paddingHorizontal: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  chip: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: space.sm },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    padding: 2,
    justifyContent: 'center',
  },
  knob: { width: 20, height: 20, borderRadius: 10 },
  segmented: { flexDirection: 'row', borderRadius: radius.pill, padding: 3, alignSelf: 'center' },
  segment: { paddingHorizontal: 14, height: 32, borderRadius: radius.pill, justifyContent: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: 15,
    minHeight: 54,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: space.gutter,
    paddingTop: 10,
    shadowOpacity: 0.15,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: -4 },
    elevation: 16,
  },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: space.lg },
});
