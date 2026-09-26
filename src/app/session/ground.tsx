import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BreathCircle } from '@/components/Breath';
import { T } from '@/components/T';
import { CircleButton, PillButton, Screen, TopBar } from '@/components/ui';
import { BREATH_PATTERNS } from '@/content/copy';
import { useT } from '@/i18n';
import { formatClock } from '@/lib/date';
import { space } from '@/theme/tokens';

const SECONDS = 60;
const SETTLE = BREATH_PATTERNS[0];

// The optional one-minute breath before writing.
export default function Ground() {
  const t = useT();
  const params = useLocalSearchParams<Record<string, string>>();
  const [left, setLeft] = useState(SECONDS);

  const leaving = useRef(false);

  const toWriting = () => {
    if (leaving.current) return;
    leaving.current = true;
    router.replace({ pathname: '/session/write', params });
  };

  useEffect(() => {
    const id = setInterval(() => setLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (left <= 0) toWriting();
  }, [left]);

  return (
    <Screen scroll={false} edges={['top', 'bottom']}>
      <TopBar
        left={<CircleButton icon="back" label={t.common.back} onPress={() => router.back()} />}
        center={<T variant="label">{t.ground.label}</T>}
      />
      <View style={styles.center}>
        <T variant="title" center>
          {t.ground.title}
        </T>
        <T variant="small" tone="faint" center style={{ marginTop: space.xs, marginBottom: space.xl }}>
          {t.ground.hint}
        </T>
        <BreathCircle pattern={SETTLE} running size={260} />
        <T variant="label" style={{ marginTop: space.xl }}>
          {formatClock(Math.max(left, 0))}
        </T>
      </View>
      <PillButton title={t.ground.start} kind="secondary" icon="arrow" onPress={toWriting} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
