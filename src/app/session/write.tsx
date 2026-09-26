import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeOut, LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CrossfadeText } from '@/components/CrossfadeText';
import { Icon } from '@/components/Icon';
import { T } from '@/components/T';
import { CircleButton, PillButton, Sheet } from '@/components/ui';
import { isSessionType, sessionMinutes, type SessionType, type SoundId } from '@/content/copy';
import { useT } from '@/i18n';
import { formatClock, wordCount } from '@/lib/date';
import { done, tap } from '@/lib/haptics';
import { useFocusSound } from '@/lib/useFocusSound';
import { useStore } from '@/store/store';
import { useTheme } from '@/theme/theme';
import { fonts, space } from '@/theme/tokens';

type Params = {
  type: SessionType;
  checkinId?: string;
  captureId?: string;
  starters?: string;
  companion?: string;
  sound?: SoundId;
};

// A random index into a list, never the same as `not`. Indexes (not strings) keep the
// prompt and phrase stable if the language changes mid-session.
const pickIndex = (length: number, not?: number | null) => {
  const options = Array.from({ length }, (_, i) => i).filter((i) => i !== not);
  return options[Math.floor(Math.random() * options.length)];
};

// Companion phrases change on a slow rhythm, or sooner when the writer pauses.
const PHRASE_EVERY_MS = 40_000;
const PAUSE_MS = 9_000;

export default function Write() {
  const { c } = useTheme();
  const t = useT();
  const params = useLocalSearchParams<Params>();
  const { data, addSession } = useStore();
  const type: SessionType = isSessionType(params.type) ? params.type : 'pause';
  const minutes = sessionMinutes(type);
  const capture = data.captures.find((x) => x.id === params.captureId);
  const showStarter = params.starters === '1' && !capture;
  const companion = params.companion === '1';
  const sound = params.sound ?? 'none';

  const [text, setText] = useState('');
  const [started, setStarted] = useState(false);
  const [starter, setStarter] = useState(() => pickIndex(t.starters.length));
  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const [muted, setMuted] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [phrase, setPhrase] = useState<number | null>(null);
  const phraseAt = useRef(Date.now());
  const typedAt = useRef(Date.now());
  const answeredPause = useRef(false);
  const notified = useRef(false);

  useFocusSound(sound, muted);

  const planned = minutes * 60;
  const elapsed = (now - startedAt) / 1000;
  const remaining = planned - elapsed;
  const timeUp = remaining <= 0;
  const words = wordCount(text);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (timeUp && !notified.current) {
      notified.current = true;
      done();
    }
    if (!companion || timeUp || !started) return;
    const paused = now - typedAt.current > PAUSE_MS;
    // One phrase per pause, otherwise a slow rotation while the writing flows.
    if ((paused && !answeredPause.current) || now - phraseAt.current > PHRASE_EVERY_MS) {
      if (paused) answeredPause.current = true;
      phraseAt.current = now;
      setPhrase((p) => pickIndex(t.companion.length, p));
    }
  }, [now, timeUp, companion, started, t.companion.length]);

  const onChange = (value: string) => {
    setText(value);
    typedAt.current = Date.now();
    answeredPause.current = false;
    if (!started && value.trim().length > 0) setStarted(true);
  };

  const finish = () => {
    const trimmed = text.trim();
    if (!trimmed) {
      router.back();
      return;
    }
    const id = addSession({
      type,
      startedAt,
      endedAt: Date.now(),
      plannedMinutes: minutes,
      text: trimmed,
      wordCount: wordCount(trimmed),
      checkinId: params.checkinId,
      captureId: params.captureId,
    });
    router.replace({ pathname: '/session/complete', params: { id } });
  };

  const opening = capture ? capture.text : showStarter ? t.starters[starter] : null;
  const bottomPhrase = timeUp ? t.write.timeUp : phrase === null ? null : t.companion[phrase];

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: c.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <CircleButton icon="close" label={t.write.leave} onPress={() => setLeaving(true)} />
          <View style={{ alignItems: 'center' }}>
            <T variant="label">{t.sessions[type].name}</T>
            <T variant="medium" style={{ marginTop: 2, fontVariant: ['tabular-nums'] }}>
              {timeUp ? t.write.time : formatClock(remaining)}
            </T>
          </View>
          {sound !== 'none' ? (
            <CircleButton
              icon={muted ? 'soundOff' : 'sound'}
              label={muted ? t.write.unmute : t.write.mute}
              onPress={() => setMuted((m) => !m)}
            />
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        <View style={[styles.track, { backgroundColor: c.hairline }]}>
          <View
            style={{
              height: 1,
              width: `${Math.min(100, (elapsed / planned) * 100)}%`,
              backgroundColor: c.ink,
            }}
          />
        </View>

        <View style={styles.page}>
          {opening && !started && (
            <Animated.View exiting={FadeOut.duration(600)} style={styles.opening}>
              <T variant="label">{capture ? t.write.captured : t.write.beginHere}</T>
              <View style={styles.openingRow}>
                <T variant="italic" style={{ flex: 1, fontSize: 24, lineHeight: 32 }}>
                  {opening}
                </T>
                {!capture && (
                  <Pressable
                    accessibilityLabel={t.write.anotherPrompt}
                    hitSlop={10}
                    onPress={() => {
                      tap();
                      setStarter((s) => pickIndex(t.starters.length, s));
                    }}>
                    <Icon name="refresh" size={18} color={c.inkFaint} />
                  </Pressable>
                )}
              </View>
            </Animated.View>
          )}

          <Animated.View layout={LinearTransition.duration(500)} style={{ flex: 1 }}>
            <TextInput
              value={text}
              onChangeText={onChange}
              multiline
              autoFocus
              scrollEnabled
              textAlignVertical="top"
              placeholder={t.write.placeholder}
              placeholderTextColor={c.inkFaint}
              selectionColor={c.accent}
              style={[styles.input, { color: c.ink }]}
            />
          </Animated.View>
        </View>

        <View style={[styles.bottom, { borderTopColor: c.hairline }]}>
          <View style={styles.phraseSlot}>
            <CrossfadeText text={bottomPhrase} />
          </View>
          <View style={styles.actions}>
            <T variant="label">{t.common.words(words)}</T>
            <PillButton
              title={t.write.finish}
              kind={timeUp ? 'primary' : 'secondary'}
              onPress={finish}
              disabled={!text.trim()}
              style={{ height: 42 }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>

      <Sheet visible={leaving} onClose={() => setLeaving(false)} title={t.write.leaveTitle}>
        <View style={{ gap: 10 }}>
          {text.trim() ? (
            <PillButton
              title={t.write.finishKeep}
              onPress={() => {
                setLeaving(false);
                finish();
              }}
            />
          ) : null}
          <PillButton title={t.write.keepWriting} kind="secondary" onPress={() => setLeaving(false)} />
          <PillButton
            title={text.trim() ? t.write.leaveWithoutSaving : t.write.leaveEmpty}
            kind="ghost"
            onPress={() => {
              setLeaving(false);
              router.back();
            }}
          />
        </View>
      </Sheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.gutter,
    height: 60,
  },
  track: { height: 1, marginHorizontal: space.gutter },
  page: { flex: 1, paddingHorizontal: space.gutter, paddingTop: space.lg },
  opening: { marginBottom: space.lg, gap: space.sm },
  openingRow: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  input: {
    flex: 1,
    fontFamily: fonts.serif,
    fontSize: 20,
    lineHeight: 31,
    padding: 0,
  },
  bottom: {
    paddingHorizontal: space.gutter,
    paddingTop: 10,
    paddingBottom: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  phraseSlot: { minHeight: 26, justifyContent: 'center', marginBottom: 8 },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
