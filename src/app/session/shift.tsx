import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { T } from '@/components/T';
import { Chip, CircleButton, Hairline, PillButton, Screen, TopBar } from '@/components/ui';
import { SHIFT_AREAS, SHIFT_VALUES, type ShiftArea, type ShiftValue } from '@/content/copy';
import { useT } from '@/i18n';
import { useStore } from '@/store/store';
import { space } from '@/theme/tokens';

export default function Shift() {
  const t = useT();
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
      <TopBar left={<CircleButton icon="back" label={t.common.back} onPress={() => router.back()} />} />
      <T variant="display">{t.shift.title}</T>
      <T variant="serif" tone="soft" style={{ marginTop: space.sm }}>
        {t.shift.intro}
      </T>

      <View style={{ marginTop: space.xl }}>
        {SHIFT_AREAS.map((area) => {
          const copy = t.shift.areas[area];
          return (
            <View key={area}>
              <Hairline />
              <View style={{ paddingVertical: space.lg, gap: space.md }}>
                <T variant="heading">{copy.name}</T>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
                  {SHIFT_VALUES.map((value) => (
                    <Chip
                      key={value}
                      label={copy[value]}
                      selected={picked[area] === value}
                      onPress={() => setPicked((p) => ({ ...p, [area]: p[area] === value ? undefined : value }))}
                    />
                  ))}
                </View>
              </View>
            </View>
          );
        })}
        <Hairline />
      </View>

      <View style={{ gap: space.sm, marginTop: space.xl }}>
        <PillButton title={t.common.save} onPress={save} disabled={!any} />
        <PillButton title={t.common.skip} kind="ghost" onPress={() => router.dismissTo('/')} />
      </View>
    </Screen>
  );
}
