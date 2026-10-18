import { useEffect, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';

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
const FONT_ORDER: WritingFont[] = ['serif', 'sans', 'mono'];

const POPOVER_W = 212;
const ARROW = 12;

export type WritingPrefs = { font: WritingFont; sound: SoundId; companion: boolean };

// The three faces side by side, each showing "Aa" in itself.
function FontTiles({ value, onPick }: { value: WritingFont; onPick: (font: WritingFont) => void }) {
  const { c } = useTheme();
  const t = useT();
  return (
    <View style={styles.fonts}>
      {FONT_ORDER.map((f) => {
        const selected = value === f;
        return (
          <Pressable
            key={f}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={t.write.fonts[f]}
            onPress={() => {
              tap();
              onPick(f);
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
  );
}

// A small bubble of choices hanging under one of the editor's header icons, its pointer aimed
// at the icon. A tap picks an option and closes it; a tap anywhere else just closes it.
export function ChoicePopover<V extends string>({
  visible,
  options,
  value,
  anchorX,
  top,
  onPick,
  onClose,
}: {
  visible: boolean;
  options: { value: V; label: string; leading?: ReactNode }[];
  value: V;
  // Centre of the icon and the bubble's top edge, in the parent's coordinates.
  anchorX: number;
  top: number;
  onPick: (value: V) => void;
  onClose: () => void;
}) {
  const { c } = useTheme();
  const t = useT();
  const { width } = useWindowDimensions();
  if (!visible) return null;
  // Kept on screen with a small margin; the pointer still aims at the icon.
  const left = Math.max(12, Math.min(width - POPOVER_W - 12, anchorX - POPOVER_W / 2));
  const arrowLeft = Math.max(16, Math.min(POPOVER_W - 16 - ARROW, anchorX - left - ARROW / 2));

  return (
    <View style={StyleSheet.absoluteFill}>
      <Pressable accessibilityLabel={t.common.close} style={StyleSheet.absoluteFill} onPress={onClose} />
      <Animated.View
        entering={ZoomIn.duration(170).withInitialValues({ transform: [{ scale: 0.92 }] })}
        exiting={FadeOut.duration(120)}
        style={[styles.popover, { left, top, backgroundColor: c.surface, borderColor: c.hairline, shadowColor: c.shadow }]}>
        <View style={[styles.arrow, { left: arrowLeft, backgroundColor: c.surface, borderColor: c.hairline }]} />
        {options.map((o, i) => {
          const selected = value === o.value;
          return (
            <Pressable
              key={o.value}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={o.label}
              onPress={() => {
                tap();
                onPick(o.value);
                onClose();
              }}
              style={({ pressed }) => [
                styles.option,
                i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.hairline },
                { opacity: pressed ? 0.6 : 1 },
              ]}>
              {o.leading}
              <T variant="body" style={{ flex: 1 }}>
                {o.label}
              </T>
              {selected && <Icon name="check" size={18} color={c.ink} />}
            </Pressable>
          );
        })}
      </Animated.View>
    </View>
  );
}

// The typefaces as popover options, each led by "Aa" set in itself.
export function useFontOptions() {
  const t = useT();
  return FONT_ORDER.map((f) => ({
    value: f,
    label: t.write.fonts[f],
    leading: <T style={{ fontFamily: WRITING_FONTS[f].family, fontSize: 20, lineHeight: 26, width: 36 }}>Aa</T>,
  }));
}

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
        <FontTiles value={prefs.font} onPick={(font) => onChange({ font })} />

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
  popover: {
    position: 'absolute',
    width: POPOVER_W,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  // A small square turned 45°, half hidden behind the bubble: the pointer to the icon.
  arrow: {
    position: 'absolute',
    top: -ARROW / 2,
    width: ARROW,
    height: ARROW,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderTopWidth: StyleSheet.hairlineWidth,
    transform: [{ rotate: '45deg' }],
  },
  option: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 50 },
  soundHint: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: space.sm, minHeight: 20 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md },
  note: { marginTop: space.lg },
});
