// The writing machine: a metal rail across the page and a small capsule riding on it.
// The capsule is the session's quiet clock — three lamps that fill as time passes —
// and it follows the caret, character by character, like a typewriter carriage.
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

export const MACHINE = {
  body: '#1A1917',
  bodyText: '#E9E4DA',
  bodyFaint: 'rgba(233,228,218,0.45)',
  paper: { light: '#F6F2EA', dark: '#23211E' },
};

const RAIL_HEIGHT = 9;
const CAPSULE_W = 78;
const CAPSULE_H = 30;
export const RAIL_SPACE = CAPSULE_H + 14;
// From the rail row's top edge to the tip of the type guide above the capsule.
export const GUIDE_TIP = (RAIL_SPACE - CAPSULE_H) / 2 - 10;

// ---------- Carriage ----------

// Where the capsule sits along the rail. A jump back to the left margin is a carriage return:
// a springier swing than the small steps along a line.
export function useCarriage(offset: number) {
  const reduced = useReducedMotion();
  const slide = useSharedValue(offset);
  useEffect(() => {
    if (reduced) {
      slide.value = offset;
      return;
    }
    const returning = offset < slide.value - 60;
    slide.value = returning
      ? withSpring(offset, { damping: 13, stiffness: 140 })
      : withTiming(offset, { duration: 120, easing: Easing.out(Easing.quad) });
  }, [offset, reduced, slide]);
  return slide;
}

// ---------- Rail ----------

function Indicator({ lit, current, alert }: { lit: boolean; current: boolean; alert: boolean }) {
  const reduced = useReducedMotion();
  const glow = useSharedValue(1);

  useEffect(() => {
    if (current && !reduced) {
      glow.value = withRepeat(withSequence(withTiming(0.35, { duration: 1400 }), withTiming(1, { duration: 1400 })), -1);
    } else {
      cancelAnimation(glow);
      glow.value = withTiming(1, { duration: 300 });
    }
  }, [current, reduced, glow]);

  const style = useAnimatedStyle(() => ({ opacity: glow.value }));
  const color = alert ? '#C8553D' : lit || current ? '#7FA27A' : 'rgba(26,25,23,0.18)';
  return <Animated.View style={[styles.indicator, { backgroundColor: color }, current && style]} />;
}

export function Rail({
  progress,
  timeUp,
  strike,
  slide,
}: {
  progress: number;
  timeUp: boolean;
  // Bumped by the screen on every key.
  strike: number;
  slide: SharedValue<number>;
}) {
  const reduced = useReducedMotion();
  const x = useSharedValue(0);
  const hammer = useSharedValue(0);

  // A key strike: the guide dips, the capsule ticks a hair to the right and settles.
  useEffect(() => {
    if (!strike || reduced) return;
    hammer.value = withSequence(withTiming(1, { duration: 40 }), withTiming(0, { duration: 140 }));
    x.value = withSequence(withTiming(1.5, { duration: 40 }), withSpring(0, { damping: 12, stiffness: 400 }));
  }, [strike, reduced, hammer, x]);

  const capsule = useAnimatedStyle(() => ({ transform: [{ translateX: slide.value + x.value }] }));
  const guide = useAnimatedStyle(() => ({ transform: [{ translateY: hammer.value * 3 }] }));

  const filled = Math.min(3, Math.floor(progress * 3));

  return (
    <View pointerEvents="none" style={styles.wrap}>
      <View style={styles.rail}>
        <View style={styles.railShine} />
      </View>
      <View style={[styles.cap, { left: 0 }]} />
      <View style={[styles.cap, { right: 0 }]} />

      <Animated.View style={[styles.capsuleSlot, capsule]}>
        <Animated.View style={[styles.guide, guide]}>
          <View style={styles.guideBar} />
          <View style={styles.guideStem} />
        </Animated.View>
        <View style={styles.capsule}>
          <View style={styles.capsuleShine} />
          {[0, 1, 2].map((i) => (
            <Indicator key={i} lit={timeUp || i < filled} current={!timeUp && i === filled} alert={timeUp} />
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: RAIL_SPACE, justifyContent: 'center' },
  rail: {
    height: RAIL_HEIGHT,
    marginHorizontal: 4,
    borderRadius: RAIL_HEIGHT / 2,
    backgroundColor: '#3A3936',
    borderWidth: 1,
    borderColor: '#24231F',
    overflow: 'hidden',
  },
  railShine: { height: 2, marginTop: 1.5, marginHorizontal: 6, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.18)' },
  cap: {
    position: 'absolute',
    top: (RAIL_SPACE - 18) / 2,
    width: 9,
    height: 18,
    borderRadius: 2.5,
    backgroundColor: '#2A2926',
  },
  capsuleSlot: {
    position: 'absolute',
    alignSelf: 'center',
    alignItems: 'center',
    top: GUIDE_TIP,
  },
  guide: { alignItems: 'center', height: 10 },
  guideBar: { width: 9, height: 1.5, borderRadius: 1, backgroundColor: '#55524C' },
  guideStem: { width: 1.5, height: 8.5, backgroundColor: '#55524C' },
  capsule: {
    width: CAPSULE_W,
    height: CAPSULE_H,
    borderRadius: CAPSULE_H / 2,
    backgroundColor: '#EDE7DB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(26,25,23,0.25)',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  capsuleShine: {
    position: 'absolute',
    top: 3,
    left: 12,
    right: 12,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  indicator: { width: 6, height: 6, borderRadius: 3 },
});
