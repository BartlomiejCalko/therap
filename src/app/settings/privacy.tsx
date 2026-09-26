import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { T } from '@/components/T';
import { CircleButton, Hairline, PillButton, Screen, Sheet, TopBar } from '@/components/ui';
import { useT } from '@/i18n';
import { clearPin } from '@/lib/pin';
import { useStore } from '@/store/store';
import { space } from '@/theme/tokens';

export default function Privacy() {
  const t = useT();
  const { resetAll } = useStore();
  const [confirm, setConfirm] = useState(false);

  return (
    <Screen edges={['top', 'bottom']}>
      <TopBar left={<CircleButton icon="back" label={t.common.back} onPress={() => router.back()} />} />
      <T variant="display">{t.privacy.title}</T>

      <View style={{ marginTop: space.xl }}>
        {t.privacy.points.map((p) => (
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

      <PillButton
        title={t.privacy.deleteAll}
        kind="secondary"
        style={{ marginTop: space.xl }}
        onPress={() => setConfirm(true)}
      />

      <Sheet visible={confirm} onClose={() => setConfirm(false)} title={t.privacy.confirmTitle}>
        <T variant="body" tone="soft" center style={{ marginBottom: space.lg }}>
          {t.privacy.confirmBody}
        </T>
        <View style={{ gap: 10 }}>
          <PillButton
            title={t.privacy.confirm}
            onPress={async () => {
              await clearPin();
              resetAll();
              setConfirm(false);
              router.dismissAll();
            }}
          />
          <PillButton title={t.common.cancel} kind="ghost" onPress={() => setConfirm(false)} />
        </View>
      </Sheet>
    </Screen>
  );
}
