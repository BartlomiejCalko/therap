import { Pressable, StyleSheet, View } from 'react-native';

import { tap } from '@/lib/haptics';
import { useTheme } from '@/theme/theme';

import { Icon } from './Icon';
import { T } from './T';

export const PIN_LENGTH = 4;

export function PinDots({ length, error }: { length: number; error?: boolean }) {
  const { c } = useTheme();
  return (
    <View style={styles.dots}>
      {Array.from({ length: PIN_LENGTH }, (_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            { borderColor: error ? c.accent : c.ink },
            i < length && { backgroundColor: error ? c.accent : c.ink },
          ]}
        />
      ))}
    </View>
  );
}

export function PinPad({ onDigit, onDelete }: { onDigit: (d: string) => void; onDelete: () => void }) {
  const { c } = useTheme();
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];
  return (
    <View style={styles.pad}>
      {keys.map((k, i) =>
        k === '' ? (
          <View key={i} style={styles.key} />
        ) : (
          <Pressable
            key={i}
            accessibilityRole="button"
            accessibilityLabel={k === 'del' ? 'Delete' : k}
            onPress={() => {
              tap();
              if (k === 'del') onDelete();
              else onDigit(k);
            }}
            style={({ pressed }) => [styles.key, pressed && { backgroundColor: c.surfaceAlt }]}>
            {k === 'del' ? (
              <Icon name="back" size={22} />
            ) : (
              <T variant="title" style={{ fontSize: 28 }}>
                {k}
              </T>
            )}
          </Pressable>
        ),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dots: { flexDirection: 'row', gap: 18, justifyContent: 'center', marginVertical: 28 },
  dot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1 },
  pad: { flexDirection: 'row', flexWrap: 'wrap', width: 3 * 84, alignSelf: 'center' },
  key: { width: 84, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
});
