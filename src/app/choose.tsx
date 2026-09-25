import { router, useLocalSearchParams } from 'expo-router';

import { ChooseSession } from '@/components/ChooseSession';
import { CircleButton, Screen, TopBar } from '@/components/ui';

export default function Choose() {
  const { checkinId, captureId } = useLocalSearchParams<{ checkinId?: string; captureId?: string }>();
  return (
    <Screen>
      <TopBar left={<CircleButton icon="back" label="Back" onPress={() => router.back()} />} />
      <ChooseSession ctx={{ checkinId, captureId }} />
    </Screen>
  );
}
