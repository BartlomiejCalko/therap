import { Pressable, StyleSheet, View } from 'react-native';

import { type SessionType } from '@/content/copy';
import { useT } from '@/i18n';
import { timeOfDay } from '@/lib/date';
import { tap } from '@/lib/haptics';
import type { Capture, Session } from '@/store/types';
import { useTheme } from '@/theme/theme';
import { radius, space, type Palette } from '@/theme/tokens';

import { Icon } from './Icon';
import { SessionMark } from './SessionMark';
import { T } from './T';

export const toneFor = (c: Palette, type: SessionType) =>
  ({ pause: c.tones[1], clarity: c.tones[2], space: c.tones[3], release: c.tones[0] })[type];

export function SessionTile({
  session,
  onPress,
  width = 158,
}: {
  session: Session;
  onPress: () => void;
  width?: number;
}) {
  const { c } = useTheme();
  const t = useT();
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [
        styles.tile,
        { width, backgroundColor: toneFor(c, session.type), opacity: pressed ? 0.75 : 1 },
      ]}>
      <SessionMark type={session.type} size={26} />
      <View style={{ flex: 1, marginTop: space.md }}>
        {session.released ? (
          <T variant="italic" tone="soft" style={{ fontSize: 16, lineHeight: 22 }}>
            {t.common.letGo}
          </T>
        ) : (
          <T variant="serifSmall" numberOfLines={5} style={{ fontSize: 15, lineHeight: 21 }}>
            {session.text}
          </T>
        )}
      </View>
      <T variant="label" style={{ marginTop: space.sm }}>
        {t.sessions[session.type].name} · {t.dates.weekdayShort(new Date(session.startedAt))}
      </T>
    </Pressable>
  );
}

export function CaptureCard({
  capture,
  onUnload,
  onMore,
}: {
  capture: Capture;
  onUnload: () => void;
  onMore: () => void;
}) {
  const { c } = useTheme();
  const t = useT();
  const explored = capture.status === 'explored';
  return (
    <View style={[styles.capture, { backgroundColor: explored ? c.bg : c.surface, borderColor: c.hairline }]}>
      <View style={styles.captureTop}>
        <T variant="label">{timeOfDay(capture.createdAt)}</T>
        <Pressable accessibilityLabel={t.common.moreOptions} hitSlop={10} onPress={onMore}>
          <Icon name="more" size={18} color={c.inkFaint} />
        </Pressable>
      </View>
      <T variant="serifSmall" tone={explored ? 'soft' : 'ink'} style={{ marginTop: space.sm }}>
        {capture.text}
      </T>
      {explored ? (
        <View style={styles.status}>
          <View style={[styles.statusDot, { backgroundColor: c.inkFaint }]} />
          <T variant="label">{t.capture.explored}</T>
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            tap();
            onUnload();
          }}
          style={({ pressed }) => [styles.status, { opacity: pressed ? 0.5 : 1 }]}>
          <T variant="medium" style={{ fontSize: 13 }}>
            {t.capture.unloadThis}
          </T>
          <Icon name="arrow" size={14} />
        </Pressable>
      )}
    </View>
  );
}

// Rough height guess used to balance the masonry columns.
export const estimateCapture = (capture: Capture) => 90 + Math.ceil(capture.text.length / 18) * 23;

const styles = StyleSheet.create({
  tile: { height: 200, borderRadius: radius.card, padding: 14 },
  capture: { borderRadius: radius.card, padding: 14, borderWidth: StyleSheet.hairlineWidth },
  captureTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  status: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: space.md },
  statusDot: { width: 5, height: 5, borderRadius: 2.5 },
});
