import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { toneFor } from '@/components/Cards';
import { SessionMark } from '@/components/SessionMark';
import { T } from '@/components/T';
import { CircleButton, Hairline, PillButton, Screen, Sheet, TopBar } from '@/components/ui';
import { SHIFT_AREAS } from '@/content/copy';
import { useT } from '@/i18n';
import { timeOfDay } from '@/lib/date';
import { useStore } from '@/store/store';
import { useTheme } from '@/theme/theme';
import { radius, space } from '@/theme/tokens';

// A single session, laid out like a Cosmos element: the piece, a caption, one clear action.
export default function Entry() {
  const { c } = useTheme();
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, releaseSession, deleteSession } = useStore();
  const [menu, setMenu] = useState(false);
  const session = data.sessions.find((s) => s.id === id);

  if (!session) {
    return (
      <Screen>
        <TopBar left={<CircleButton icon="back" label={t.common.back} onPress={() => router.back()} />} />
        <T variant="italic" tone="faint" center style={{ marginTop: space.xxl }}>
          {t.entry.missing}
        </T>
      </Screen>
    );
  }

  const checkin = data.checkins.find((x) => x.id === session.checkinId);
  const capture = data.captures.find((x) => x.id === session.captureId);
  const minutes = Math.max(1, Math.round((session.endedAt - session.startedAt) / 60000));
  const shifts = SHIFT_AREAS.filter((a) => session.shift?.[a]);

  return (
    <Screen edges={['top', 'bottom']}>
      <TopBar
        left={<CircleButton icon="back" label={t.common.back} onPress={() => router.back()} />}
        right={<CircleButton icon="more" label={t.common.more} onPress={() => setMenu(true)} />}
      />

      <View style={{ alignItems: 'center', gap: space.sm, marginTop: space.md }}>
        <SessionMark type={session.type} size={40} />
        <T variant="label">
          {t.sessions[session.type].name} · {t.common.minutes(minutes)} · {t.common.words(session.wordCount)}
        </T>
        <T variant="title" center>
          {t.dates.long(new Date(session.startedAt))}
        </T>
        <T variant="small" tone="faint">
          {timeOfDay(session.startedAt)}
        </T>
      </View>

      {(checkin || capture) && (
        <View style={styles.context}>
          {checkin && (
            <View style={[styles.tag, { borderColor: c.hairline }]}>
              <T variant="small">
                {t.states[checkin.state]}
                {checkin.name ? ` — ${checkin.name}` : ''}
              </T>
            </View>
          )}
          {capture && (
            <View style={[styles.tag, { borderColor: c.hairline }]}>
              <T variant="small" numberOfLines={1}>
                {t.entry.fromCapture(capture.text)}
              </T>
            </View>
          )}
        </View>
      )}

      <View style={[styles.page, { backgroundColor: toneFor(c, session.type) }]}>
        {session.released ? (
          <T variant="italic" tone="soft" center style={{ paddingVertical: space.xl }}>
            {t.entry.released}
          </T>
        ) : (
          <T variant="serif">{session.text}</T>
        )}
      </View>

      {shifts.length > 0 && (
        <View style={{ marginTop: space.lg }}>
          <T variant="label" style={{ marginBottom: space.sm }}>
            {t.entry.shifted}
          </T>
          {shifts.map((area, i) => (
            <View key={area}>
              {i > 0 && <Hairline />}
              <View style={styles.shiftRow}>
                <T variant="body" tone="soft">
                  {t.shift.areas[area].name}
                </T>
                <T variant="medium">{t.shift.areas[area][session.shift![area]!]}</T>
              </View>
            </View>
          ))}
        </View>
      )}

      <PillButton
        title={t.entry.again}
        icon="arrow"
        style={{ marginTop: space.xl }}
        onPress={() => router.push('/choose')}
      />

      <Sheet visible={menu} onClose={() => setMenu(false)} title={t.entry.sheetTitle}>
        <View style={{ gap: 10 }}>
          {!session.released && (
            <PillButton
              title={t.entry.letGo}
              onPress={() => {
                releaseSession(session.id);
                setMenu(false);
              }}
            />
          )}
          <PillButton
            title={t.entry.delete}
            kind="secondary"
            onPress={() => {
              setMenu(false);
              deleteSession(session.id);
              router.back();
            }}
          />
          <T variant="small" tone="faint" center style={{ marginTop: space.xs }}>
            {t.entry.note}
          </T>
        </View>
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  context: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, justifyContent: 'center', marginTop: space.lg },
  tag: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    maxWidth: '100%',
  },
  page: { borderRadius: radius.card, padding: 20, marginTop: space.lg },
  shiftRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
});
