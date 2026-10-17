import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { SESSIONS } from '@/content/copy';
import { useT } from '@/i18n';
import { beginSession, type FlowContext } from '@/lib/flow';
import { tap } from '@/lib/haptics';
import { useStore } from '@/store/store';
import { useTheme } from '@/theme/theme';
import { radius, space } from '@/theme/tokens';

import { toneFor } from './Cards';
import { Icon } from './Icon';
import { InkPress } from './motion';
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
      <T variant="display" style={{ marginTop: space.sm }}>
        {t.choose.title}
      </T>
      <T variant="body" tone="soft" style={{ marginTop: space.xs }}>
        {t.choose.subtitle}
      </T>

      {capture && (
        <View style={[styles.context, { backgroundColor: c.surface, borderColor: c.hairline }]}>
          <T variant="label">{t.choose.unloading}</T>
          <T variant="type" style={{ marginTop: 6 }}>
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

      {/* One wide card per session, stacked, so each reads in a single glance. */}
      <View style={styles.list}>
        {SESSIONS.map((s) => {
          const copy = t.sessions[s.id];
          return (
            <InkPress
              key={s.id}
              accessibilityRole="button"
              accessibilityLabel={t.choose.a11y(copy.name, s.minutes, copy.line)}
              inkColor={c.ink}
              onPress={() => {
                tap();
                beginSession(s.id, ctx, data.settings);
              }}
              style={[styles.tile, { backgroundColor: toneFor(c, s.id) }]}>
              <View style={styles.tileTop}>
                <SessionMark type={s.id} size={34} color={c.inkSoft} />
                <T variant="small" tone="soft">
                  {t.common.minutes(s.minutes)}
                </T>
              </View>
              <T variant="title" style={{ fontSize: 28, lineHeight: 34, marginTop: space.sm }}>
                {copy.name}
              </T>
              <View style={styles.tileBottom}>
                <T variant="small" tone="soft" style={{ flex: 1 }}>
                  {copy.line}
                </T>
                <Icon name="arrow" size={18} color={c.ink} />
              </View>
            </InkPress>
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
  list: { gap: 12, marginTop: space.lg },
  tile: { borderRadius: radius.card, paddingVertical: 18, paddingHorizontal: 22 },
  tileTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  tileBottom: { flexDirection: 'row', alignItems: 'flex-end', gap: space.md, marginTop: 4 },
});
