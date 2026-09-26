import { router, useLocalSearchParams } from 'expo-router';

import { ChooseSession } from '@/components/ChooseSession';
import { CircleButton, Screen, TopBar } from '@/components/ui';
import { useT } from '@/i18n';

export default function Choose() {
  const t = useT();
  const { checkinId, captureId } = useLocalSearchParams<{ checkinId?: string; captureId?: string }>();
  return (
    <Screen>
      <TopBar left={<CircleButton icon="back" label={t.common.back} onPress={() => router.back()} />} />
      <ChooseSession ctx={{ checkinId, captureId }} />
    </Screen>
  );
}
