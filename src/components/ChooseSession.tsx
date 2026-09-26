import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { SESSIONS } from '@/content/copy';
import { useT } from '@/i18n';
import { beginSession, type FlowContext } from '@/lib/flow';
import { tap } from '@/lib/haptics';
import { useStore } from '@/store/store';
import { useTheme } from '@/theme/theme';
import { radius, space } from '@/theme/tokens';

import { toneFor } from './Cards';
import { SessionMark } from './SessionMark';
import { T } from './T';
import { TextLink } from './ui';

// Session picker shared by the Unload tab and the check-in / capture flows.
export function ChooseSession({ ctx }: { ctx: FlowContext }) {
  const { c } = useTheme();
  const t = useT();
  const { data } = useStore();
  const capture = data.captures.find((x) => x.id === ctx.captureId);
  const checkin = data.checkins.find((x) => x.id === ctx.checkinId);

  return (
    <View>
      <T variant="title" center style={{ marginTop: space.md }}>
        {t.choose.title}
      </T>
      <T variant="small" tone="faint" center style={{ marginTop: space.xs }}>
        {t.choose.subtitle}
      </T>

      {capture && (
        <View style={[styles.context, { backgroundColor: c.surface, borderColor: c.hairline }]}>
          <T variant="label">{t.choose.unloading}</T>
          <T variant="italic" style={{ marginTop: 6, fontSize: 18, lineHeight: 25 }}>
            {capture.text}
          </T>
        </View>
      )}
      {checkin && !capture && (
        <View style={[styles.context, { backgroundColor: c.surface, borderColor: c.hairline }]}>
          <T variant="label">{t.choose.cameWith}</T>
          <T variant="italic" style={{ marginTop: 6, fontSize: 18, lineHeight: 25 }}>
            {t.states[checkin.state]}
            {checkin.name ? ` — ${checkin.name}` : ''}
          </T>
        </View>
      )}

      <View style={styles.grid}>
        {SESSIONS.map((s) => {
          const copy = t.sessions[s.id];
          return (
            <Pressable
              key={s.id}
              accessibilityRole="button"
              accessibilityLabel={t.choose.a11y(copy.name, s.minutes, copy.line)}
              onPress={() => {
                tap();
                beginSession(s.id, ctx, data.settings);
              }}
              style={({ pressed }) => [
                styles.tile,
                { backgroundColor: toneFor(c, s.id), opacity: pressed ? 0.75 : 1 },
              ]}>
              <View style={styles.tileTop}>
                <SessionMark type={s.id} size={36} />
                <T variant="label" tone="soft">
                  {t.common.minutes(s.minutes)}
                </T>
              </View>
              <View>
                <T variant="title" style={{ fontSize: 28 }}>
                  {copy.name}
                </T>
                <T variant="small" tone="soft" style={{ marginTop: 4 }}>
                  {copy.line}
                </T>
              </View>
            </Pressable>
          );
        })}
      </View>

      {data.settings.showHowToWrite && (
        <View style={{ alignItems: 'center', marginTop: space.lg }}>
          <TextLink
            title={t.choose.howToWrite}
            arrow={false}
            onPress={() => router.push({ pathname: '/how-to-write', params: { from: 'choose' } })}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  context: {
    marginTop: space.lg,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: space.md,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: space.lg },
  tile: {
    width: '48.5%',
    flexGrow: 1,
    aspectRatio: 0.78,
    borderRadius: radius.card,
    padding: 16,
    justifyContent: 'space-between',
  },
  tileTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
});
