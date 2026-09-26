import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { SessionMark } from '@/components/SessionMark';
import { T } from '@/components/T';
import { Chip, CircleButton, PillButton, Row, Screen, SectionLabel, Toggle, TopBar } from '@/components/ui';
import { SOUNDS, isSessionType, sessionMinutes, type SessionType } from '@/content/copy';
import { useT } from '@/i18n';
import { goToSession, optionsToParams } from '@/lib/flow';
import { useStore } from '@/store/store';
import type { SessionOptions } from '@/store/types';
import { space } from '@/theme/tokens';

// "Design your session" — only the options the person chose to be asked about each time.
export default function SessionSetup() {
  const t = useT();
  const params = useLocalSearchParams<{ type: SessionType; checkinId?: string; captureId?: string }>();
  const { settings } = useStore().data;
  const ask = settings.askEachTime;
  const [opts, setOpts] = useState<SessionOptions>(settings.defaults);
  const type: SessionType = isSessionType(params.type) ? params.type : 'pause';
  const set = (patch: Partial<SessionOptions>) => setOpts((o) => ({ ...o, ...patch }));

  const begin = () => {
    const base = Object.fromEntries(Object.entries(params).filter(([, v]) => typeof v === 'string')) as Record<
      string,
      string
    >;
    goToSession({ ...base, ...optionsToParams(opts) }, opts.breath);
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <TopBar left={<CircleButton icon="back" label={t.common.back} onPress={() => router.back()} />} />
      <View style={{ alignItems: 'center', gap: space.sm }}>
        <SessionMark type={type} size={44} />
        <T variant="title" center>
          {t.setup.title}
        </T>
        <T variant="small" tone="faint" center>
          {t.sessions[type].name} · {t.common.minutes(sessionMinutes(type))}
        </T>
      </View>

      <View style={{ marginTop: space.xl }}>
        {ask.starters && (
          <Row
            title={t.setup.starters}
            detail={t.setup.startersHint}
            right={<Toggle label={t.setup.starters} value={opts.starters} onChange={(v) => set({ starters: v })} />}
          />
        )}
        {ask.companion && (
          <Row
            title={t.setup.companion}
            detail={t.setup.companionHint}
            right={
              <Toggle label={t.setup.companion} value={opts.companion} onChange={(v) => set({ companion: v })} />
            }
          />
        )}
        {ask.breath && (
          <Row
            title={t.setup.breath}
            detail={t.setup.breathHint}
            right={<Toggle label={t.setup.breath} value={opts.breath} onChange={(v) => set({ breath: v })} />}
            last={!ask.sound}
          />
        )}
      </View>

      {ask.sound && (
        <>
          <SectionLabel>{t.setup.sound}</SectionLabel>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {SOUNDS.map((id) => (
              <Chip key={id} label={t.sounds[id]} selected={opts.sound === id} onPress={() => set({ sound: id })} />
            ))}
          </View>
        </>
      )}

      <PillButton title={t.common.begin} icon="arrow" style={{ marginTop: space.xxl }} onPress={begin} />
    </Screen>
  );
}
