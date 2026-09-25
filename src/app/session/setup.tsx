import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { SessionMark } from '@/components/SessionMark';
import { T } from '@/components/T';
import { Chip, CircleButton, PillButton, Row, Screen, SectionLabel, Toggle, TopBar } from '@/components/ui';
import { SOUNDS, sessionInfo, type SessionType } from '@/content/copy';
import { goToSession, optionsToParams } from '@/lib/flow';
import { useStore } from '@/store/store';
import type { SessionOptions } from '@/store/types';
import { space } from '@/theme/tokens';

// "Design your session" — only the options the person chose to be asked about each time.
export default function SessionSetup() {
  const params = useLocalSearchParams<{ type: SessionType; checkinId?: string; captureId?: string }>();
  const { settings } = useStore().data;
  const ask = settings.askEachTime;
  const [opts, setOpts] = useState<SessionOptions>(settings.defaults);
  const info = sessionInfo(params.type);
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
      <TopBar left={<CircleButton icon="back" label="Back" onPress={() => router.back()} />} />
      <View style={{ alignItems: 'center', gap: space.sm }}>
        <SessionMark type={info.id} size={44} />
        <T variant="title" center>
          Design your session
        </T>
        <T variant="small" tone="faint" center>
          {info.name} · {info.minutes} min
        </T>
      </View>

      <View style={{ marginTop: space.xl }}>
        {ask.starters && (
          <Row
            title="Starter prompt"
            detail="A question to begin with"
            right={<Toggle label="Starter prompt" value={opts.starters} onChange={(v) => set({ starters: v })} />}
          />
        )}
        {ask.companion && (
          <Row
            title="Companion phrases"
            detail="Quiet words above the keyboard"
            right={
              <Toggle label="Companion phrases" value={opts.companion} onChange={(v) => set({ companion: v })} />
            }
          />
        )}
        {ask.breath && (
          <Row
            title="Breathe first"
            detail="One minute to arrive before you write"
            right={<Toggle label="Breathe first" value={opts.breath} onChange={(v) => set({ breath: v })} />}
            last={!ask.sound}
          />
        )}
      </View>

      {ask.sound && (
        <>
          <SectionLabel>Focus sound</SectionLabel>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {SOUNDS.map((s) => (
              <Chip key={s.id} label={s.name} selected={opts.sound === s.id} onPress={() => set({ sound: s.id })} />
            ))}
          </View>
        </>
      )}

      <PillButton title="Begin" icon="arrow" style={{ marginTop: space.xxl }} onPress={begin} />
    </Screen>
  );
}
