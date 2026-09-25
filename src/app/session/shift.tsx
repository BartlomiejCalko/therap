import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { T } from '@/components/T';
import { Chip, CircleButton, Hairline, PillButton, Screen, TopBar } from '@/components/ui';
import { SHIFT_AREAS, type ShiftArea, type ShiftValue } from '@/content/copy';
import { useStore } from '@/store/store';
import { space } from '@/theme/tokens';

const ORDER: ShiftValue[] = ['better', 'same', 'worse'];

export default function Shift() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { setShift } = useStore();
  const [picked, setPicked] = useState<Partial<Record<ShiftArea, ShiftValue>>>({});
  const any = Object.values(picked).some(Boolean);

  const save = () => {
    setShift(id, picked);
    router.dismissTo('/');
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <TopBar left={<CircleButton icon="back" label="Back" onPress={() => router.back()} />} />
      <T variant="display">Notice the shift</T>
      <T variant="serif" tone="soft" style={{ marginTop: space.sm }}>
        There&apos;s nothing to measure. Just notice what feels different — if anything.
      </T>

      <View style={{ marginTop: space.xl }}>
        {SHIFT_AREAS.map((area) => (
          <View key={area.id}>
            <Hairline />
            <View style={{ paddingVertical: space.lg, gap: space.md }}>
              <T variant="heading">{area.name}</T>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
                {ORDER.map((value) => (
                  <Chip
                    key={value}
                    label={area.options[value]}
                    selected={picked[area.id] === value}
                    onPress={() =>
                      setPicked((p) => ({ ...p, [area.id]: p[area.id] === value ? undefined : value }))
                    }
                  />
                ))}
              </View>
            </View>
          </View>
        ))}
        <Hairline />
      </View>

      <View style={{ gap: space.sm, marginTop: space.xl }}>
        <PillButton title="Save" onPress={save} disabled={!any} />
        <PillButton title="Skip" kind="ghost" onPress={() => router.dismissTo('/')} />
      </View>
    </Screen>
  );
}
