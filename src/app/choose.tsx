import { router, useLocalSearchParams } from 'expo-router';

import { ChooseSession } from '@/components/ChooseSession';

export default function Choose() {
  const { checkinId, captureId } = useLocalSearchParams<{ checkinId?: string; captureId?: string }>();
  return <ChooseSession ctx={{ checkinId, captureId }} onBack={() => router.back()} />;
}
