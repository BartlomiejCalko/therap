import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { T } from '@/components/T';
import { CircleButton, FadeIn, PillButton, Screen, TopBar } from '@/components/ui';
import { AFFIRMATION } from '@/content/copy';
import { useTheme } from '@/theme/theme';
import { space } from '@/theme/tokens';

export default function Affirmation() {
  const { c } = useTheme();
  const { checkinId } = useLocalSearchParams<{ checkinId?: string }>();

  return (
    <Screen scroll={false} edges={['top', 'bottom']}>
      <TopBar left={<CircleButton icon="back" label="Back" onPress={() => router.back()} />} />
      <View style={styles.center}>
        <FadeIn>
          <View style={[styles.rule, { backgroundColor: c.ink }]} />
        </FadeIn>
        <FadeIn delay={300}>
          <T variant="display" center style={{ fontSize: 34, lineHeight: 42 }}>
            {AFFIRMATION}
          </T>
        </FadeIn>
      </View>
      <FadeIn delay={1400} style={{ paddingBottom: space.md }}>
        <PillButton
          title="Choose your session"
          icon="arrow"
          onPress={() => router.push({ pathname: '/choose', params: checkinId ? { checkinId } : {} })}
        />
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: space.xl, paddingHorizontal: space.sm },
  rule: { width: 28, height: 1 },
});
