import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useIsFocused } from 'expo-router';

import { BreathCircle } from '@/components/Breath';
import { T } from '@/components/T';
import { Chip, PillButton, Screen } from '@/components/ui';
import { BREATH_PATTERNS } from '@/content/copy';
import { formatClock } from '@/lib/date';
import { done } from '@/lib/haptics';
import { space } from '@/theme/tokens';

const DURATIONS = [1, 3, 5];

export default function BreathTab() {
  const focused = useIsFocused();
  const [patternId, setPatternId] = useState(BREATH_PATTERNS[0].id);
  const [minutes, setMinutes] = useState(3);
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(minutes * 60);
  const pattern = BREATH_PATTERNS.find((p) => p.id === patternId) ?? BREATH_PATTERNS[0];

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (running && left <= 0) {
      setRunning(false);
      done();
    }
  }, [left, running]);

  // Leaving the tab ends the exercise.
  useEffect(() => {
    if (!focused) setRunning(false);
  }, [focused]);

  const toggle = () => {
    if (!running) setLeft(minutes * 60);
    setRunning((r) => !r);
  };

  return (
    <Screen withTabBar contentStyle={{ paddingTop: space.lg, alignItems: 'stretch' }}>
      <T variant="title" center>
        Breath
      </T>
      <T variant="small" tone="faint" center style={{ marginTop: space.xs }}>
        {pattern.line}
      </T>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -space.gutter, marginTop: space.lg, flexGrow: 0 }}
        contentContainerStyle={{ paddingHorizontal: space.gutter, gap: space.sm }}>
        {BREATH_PATTERNS.map((p) => (
          <Chip
            key={p.id}
            label={`${p.name}  ${p.rhythm}`}
            selected={p.id === patternId}
            onPress={() => {
              setRunning(false);
              setPatternId(p.id);
            }}
          />
        ))}
      </ScrollView>

      <View style={styles.stage}>
        <BreathCircle pattern={pattern} running={running} size={290} />
      </View>

      <View style={styles.footer}>
        {running ? (
          <T variant="label" center>
            {formatClock(Math.max(left, 0))} left
          </T>
        ) : (
          <View style={styles.durations}>
            {DURATIONS.map((m) => (
              <Chip key={m} size="sm" label={`${m} min`} selected={m === minutes} onPress={() => setMinutes(m)} />
            ))}
          </View>
        )}
        <PillButton title={running ? 'Stop' : 'Begin'} kind={running ? 'secondary' : 'primary'} onPress={toggle} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stage: { alignItems: 'center', justifyContent: 'center', paddingVertical: space.xxl },
  footer: { gap: space.lg },
  durations: { flexDirection: 'row', justifyContent: 'center', gap: space.sm },
});
