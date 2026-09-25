import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { T } from '@/components/T';
import { CircleButton, Hairline, PillButton, Screen, Sheet, TopBar } from '@/components/ui';
import { clearPin } from '@/lib/pin';
import { useStore } from '@/store/store';
import { space } from '@/theme/tokens';

const POINTS = [
  {
    title: 'What we keep',
    body: 'Your sessions, captured thoughts, check-ins, what you noticed after sessions, and your settings.',
  },
  {
    title: 'Where it lives',
    body: 'Only on this device. Nothing you write is sent to a server, shared, or used to train anything.',
  },
  {
    title: 'Letting go',
    body: 'When you let a session go, its words are erased. Only the date, length and session type remain.',
  },
  {
    title: 'Your account',
    body: 'Your name and email are used to greet you and for your subscription. You can change them at any time.',
  },
];

export default function Privacy() {
  const { resetAll } = useStore();
  const [confirm, setConfirm] = useState(false);

  return (
    <Screen edges={['top', 'bottom']}>
      <TopBar left={<CircleButton icon="back" label="Back" onPress={() => router.back()} />} />
      <T variant="display">Your data</T>

      <View style={{ marginTop: space.xl }}>
        {POINTS.map((p) => (
          <View key={p.title}>
            <Hairline />
            <View style={{ paddingVertical: space.lg, gap: space.xs }}>
              <T variant="heading">{p.title}</T>
              <T variant="body" tone="soft">
                {p.body}
              </T>
            </View>
          </View>
        ))}
        <Hairline />
      </View>

      <PillButton title="Delete all my data" kind="secondary" style={{ marginTop: space.xl }} onPress={() => setConfirm(true)} />

      <Sheet visible={confirm} onClose={() => setConfirm(false)} title="Delete everything?">
        <T variant="body" tone="soft" center style={{ marginBottom: space.lg }}>
          Every session, capture and setting on this device will be erased. This cannot be undone.
        </T>
        <View style={{ gap: 10 }}>
          <PillButton
            title="Delete all data"
            onPress={async () => {
              await clearPin();
              resetAll();
              setConfirm(false);
              router.dismissAll();
            }}
          />
          <PillButton title="Cancel" kind="ghost" onPress={() => setConfirm(false)} />
        </View>
      </Sheet>
    </Screen>
  );
}
