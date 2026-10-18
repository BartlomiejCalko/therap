import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { SOUNDS, type SoundId } from '@/content/copy';
import { useT } from '@/i18n';
import { tap } from '@/lib/haptics';
import { useSoundPreview } from '@/lib/useFocusSound';
import type { WritingFont } from '@/store/types';
import { useTheme } from '@/theme/theme';
import { fonts, radius, space } from '@/theme/tokens';

import { Icon } from './Icon';
import { T } from './T';
import { Chip, Hairline, PillButton, Sheet, Toggle } from './ui';

// The three faces a person can write in, with sizes tuned so each reads at the same weight.
export const WRITING_FONTS: Record<WritingFont, { family: string; size: number }> = {
  mono: { family: fonts.typewriter, size: 18 },
  serif: { family: fonts.serif, size: 21 },
  sans: { family: fonts.sans, size: 18 },
};
const FONT_ORDER: WritingFont[] = ['mono', 'serif', 'sans'];

export type WritingPrefs = { font: WritingFont; sound: SoundId; companion: boolean };

// The editor's settings: typeface (previewed live on the word UNLOAD), background sound and
// supportive phrases. Shown before the first session, then from the editor's top right corner.
export function WritingSettings({
  visible,
  prefs,
  onChange,
  onClose,
}: {
  visible: boolean;
  prefs: WritingPrefs;
  onChange: (patch: Partial<WritingPrefs>) => void;
  onClose: () => void;
}) {
  const { c } = useTheme();
  const t = useT();
  const face = WRITING_FONTS[prefs.font];
  const sample = useSoundPreview();

  // The sample ends with the popup.
  useEffect(() => {
    if (!visible) sample.stop();
    // `sample` is a fresh object each render; only visibility matters here.
  }, [visible]);

  return (
    <Sheet visible={visible} onClose={onClose} title={t.write.settingsTitle}>
      <ScrollView style={{ maxHeight: 560 }} showsVerticalScrollIndicator={false} bounces={false}>
        {/* The preview: the app's name, set in the chosen face. */}
        <View style={[styles.preview, { backgroundColor: c.surface, borderColor: c.hairline }]}>
          <Animated.Text
            key={prefs.font}
            entering={FadeIn.duration(260)}
            style={[styles.previewWord, { color: c.ink, fontFamily: face.family }]}>
            UNLOAD
          </Animated.Text>
        </View>

        <T variant="label" style={styles.label}>
          {t.write.font}
        </T>
        <View style={styles.fonts}>
          {FONT_ORDER.map((f) => {
            const selected = prefs.font === f;
            return (
              <Pressable
                key={f}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={t.write.fonts[f]}
                onPress={() => {
                  tap();
                  onChange({ font: f });
                }}
                style={({ pressed }) => [
                  styles.font,
                  {
                    backgroundColor: selected ? c.ink : c.surface,
                    borderColor: selected ? c.ink : c.hairline,
                    opacity: pressed ? 0.75 : 1,
                  },
                ]}>
                <T style={{ fontFamily: WRITING_FONTS[f].family, fontSize: 24, lineHeight: 30, color: selected ? c.onInk : c.ink }}>
                  Aa
                </T>
                <T variant="small" style={{ color: selected ? c.onInk : c.inkSoft }} numberOfLines={1}>
                  {t.write.fonts[f]}
                </T>
              </Pressable>
            );
          })}
        </View>

        <T variant="label" style={styles.label}>
          {t.write.sound}
        </T>
        <View style={styles.chips}>
          {SOUNDS.map((id) => (
            <Chip
              key={id}
              label={t.sounds[id]}
              selected={prefs.sound === id}
              onPress={() => {
                onChange({ sound: id });
                sample.preview(id);
              }}
            />
          ))}
        </View>
        <View style={styles.soundHint}>
          {sample.playing && <Icon name="sound" size={15} color={c.inkSoft} />}
          <T variant="small" tone={sample.playing ? 'soft' : 'faint'}>
            {sample.playing ? t.write.soundPlaying(t.sounds[sample.playing]) : t.write.soundHint}
          </T>
        </View>

        <Hairline style={{ marginTop: space.lg }} />
        <View style={styles.toggleRow}>
          <View style={{ flex: 1, gap: 2 }}>
            <T variant="body">{t.write.companion}</T>
            <T variant="small" tone="faint">
              {t.write.companionHint}
            </T>
          </View>
          <Toggle label={t.write.companion} value={prefs.companion} onChange={(v) => onChange({ companion: v })} />
        </View>
        <Hairline />

        <T variant="small" tone="soft" center style={styles.note}>
          {t.write.settingsNote}
        </T>
      </ScrollView>
      <PillButton title={t.common.close} onPress={onClose} style={{ marginTop: space.md }} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  preview: {
    height: 104,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewWord: { fontSize: 38, lineHeight: 46, letterSpacing: 5 },
  label: { marginTop: space.lg, marginBottom: space.sm },
  fonts: { flexDirection: 'row', gap: 8 },
  font: {
    flex: 1,
    height: 86,
    borderRadius: radius.button,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 4,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  soundHint: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: space.sm, minHeight: 20 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md },
  note: { marginTop: space.lg },
});
