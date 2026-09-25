import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeOut, LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CrossfadeText } from '@/components/CrossfadeText';
import { Icon } from '@/components/Icon';
import { T } from '@/components/T';
import { CircleButton, PillButton, Sheet } from '@/components/ui';
import {
  COMPANION_PHRASES,
  STARTERS,
  TIME_UP_PHRASE,
  sessionInfo,
  type SessionType,
  type SoundId,
} from '@/content/copy';
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

const pick = <T,>(list: T[], not?: T) => {
  const options = list.filter((x) => x !== not);
  return options[Math.floor(Math.random() * options.length)];
};

// Companion phrases change on a slow rhythm, or sooner when the writer pauses.
const PHRASE_EVERY_MS = 40_000;
const PAUSE_MS = 9_000;

export default function Write() {
  const { c } = useTheme();
  const params = useLocalSearchParams<Params>();
  const { data, addSession } = useStore();
  const info = sessionInfo(params.type);
  const capture = data.captures.find((x) => x.id === params.captureId);
  const showStarter = params.starters === '1' && !capture;
  const companion = params.companion === '1';
  const sound = params.sound ?? 'none';

  const [text, setText] = useState('');
  const [started, setStarted] = useState(false);
  const [starter, setStarter] = useState(() => pick(STARTERS));
  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const [muted, setMuted] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [phrase, setPhrase] = useState<string | null>(null);
  const phraseAt = useRef(Date.now());
  const typedAt = useRef(Date.now());
  const answeredPause = useRef(false);
  const notified = useRef(false);

  useFocusSound(sound, muted);

  const planned = info.minutes * 60;
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
      setPhrase((p) => pick(COMPANION_PHRASES, p ?? undefined));
    }
  }, [now, timeUp, companion, started]);

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
      type: info.id,
      startedAt,
      endedAt: Date.now(),
      plannedMinutes: info.minutes,
      text: trimmed,
      wordCount: wordCount(trimmed),
      checkinId: params.checkinId,
      captureId: params.captureId,
    });
    router.replace({ pathname: '/session/complete', params: { id } });
  };

  const opening = capture ? capture.text : showStarter ? starter : null;
  const bottomPhrase = timeUp ? TIME_UP_PHRASE : phrase;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: c.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <CircleButton icon="close" label="Leave session" onPress={() => setLeaving(true)} />
          <View style={{ alignItems: 'center' }}>
            <T variant="label">{info.name}</T>
            <T variant="medium" style={{ marginTop: 2, fontVariant: ['tabular-nums'] }}>
              {timeUp ? 'Time' : formatClock(remaining)}
            </T>
          </View>
          {sound !== 'none' ? (
            <CircleButton
              icon={muted ? 'soundOff' : 'sound'}
              label={muted ? 'Play sound' : 'Mute sound'}
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
              <T variant="label">{capture ? 'Your captured thought' : 'Begin here'}</T>
              <View style={styles.openingRow}>
                <T variant="italic" style={{ flex: 1, fontSize: 24, lineHeight: 32 }}>
                  {opening}
                </T>
                {!capture && (
                  <Pressable
                    accessibilityLabel="Another prompt"
                    hitSlop={10}
                    onPress={() => {
                      tap();
                      setStarter((s) => pick(STARTERS, s));
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
              placeholder="Start anywhere."
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
            <T variant="label">
              {words} {words === 1 ? 'word' : 'words'}
            </T>
            <PillButton
              title="Finish"
              kind={timeUp ? 'primary' : 'secondary'}
              onPress={finish}
              disabled={!text.trim()}
              style={{ height: 42 }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>

      <Sheet visible={leaving} onClose={() => setLeaving(false)} title="Leave this session?">
        <View style={{ gap: 10 }}>
          {text.trim() ? (
            <PillButton
              title="Finish and keep what I wrote"
              onPress={() => {
                setLeaving(false);
                finish();
              }}
            />
          ) : null}
          <PillButton title="Keep writing" kind="secondary" onPress={() => setLeaving(false)} />
          <PillButton
            title={text.trim() ? 'Leave without saving' : 'Leave'}
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
