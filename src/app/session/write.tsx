import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  FadeOut,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { CrossfadeText } from '@/components/CrossfadeText';
import { Icon } from '@/components/Icon';
import { MACHINE, Rail, useCarriage } from '@/components/Machine';
import { PaperTexture } from '@/components/PaperTexture';
import { Dissolve } from '@/components/motion';
import { T } from '@/components/T';
import { PillButton, Sheet } from '@/components/ui';
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

const LINE = 30;
const FONT_SIZE = 18;
// The paper's side margin plus the text column's inset, i.e. where a line starts on screen.
const PAPER_MARGIN = 10;
const COLUMN_INSET = 26;

// Where the caret sits on the last line, in characters. The type is monospaced, so a greedy
// word wrap at `cols` characters matches what the text field draws closely enough to steer the capsule.
function caretColumn(text: string, cols: number) {
  const paragraph = text.split('\n').pop() ?? '';
  let line = '';
  for (const word of paragraph.split(' ')) {
    const candidate = line === '' ? word : `${line} ${word}`;
    if (candidate.length <= cols) line = candidate;
    else line = word.length > cols ? word.slice(word.length - (word.length % cols || cols)) : word;
  }
  return Math.min(line.length, cols);
}
// Space kept on the paper below the rail for the companion phrase and Finish.
const FOOT = 112;

// Companion phrases change on a slow rhythm, or sooner when the writer pauses.
const PHRASE_EVERY_MS = 40_000;
const PAUSE_MS = 9_000;

export default function Write() {
  const { c, scheme } = useTheme();
  const t = useT();
  const reduced = useReducedMotion();
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
  // The prompt stays on the page while its words drift away, then makes room.
  const [promptGone, setPromptGone] = useState(false);
  const tickedAt = useRef(0);
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

  // The machine: text grows upward from the rail, the page feeds up a line at a time.
  const [paper, setPaper] = useState({ w: 0, h: 0 });
  const [inputHeight, setInputHeight] = useState(LINE);
  const [strike, setStrike] = useState(0);
  // Measured from hidden mirrors of the text: the field's real height and the width of one character.
  const [charWidth, setCharWidth] = useState(FONT_SIZE * 0.6);
  // The last line exactly as the system wrapped it (iOS/Android report this; web does not).
  const [laidOutLine, setLaidOutLine] = useState<string | null>(null);
  const feed = useSharedValue(0);
  const feedStyle = useAnimatedStyle(() => ({ transform: [{ translateY: feed.value }] }));
  const paperColor = MACHINE.paper[scheme];

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
    // A soft tick at the end of each word, like a typewriter carriage — never more than one per 70 ms.
    const last = value[value.length - 1];
    if (value.length > text.length && (last === ' ' || last === '\n') && Date.now() - tickedAt.current > 70) {
      tickedAt.current = Date.now();
      tap();
    }
    if (value.length > text.length) setStrike((n) => n + 1);
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

  // A new line pushes the page up: hold the old position for a frame, then glide into place.
  // The height comes from a hidden Text mirror, because multiline fields on iOS don't report growth reliably.
  const onMeasured = (height: number) => {
    const next = Math.max(LINE, Math.ceil(height));
    if (next === inputHeight) return;
    if (next > inputHeight && !reduced) {
      feed.value = next - inputHeight;
      feed.value = withSpring(0, { damping: 20, stiffness: 150 });
    }
    setInputHeight(next);
  };

  // The capsule rides under the caret, like a typewriter carriage.
  const columnWidth = Math.max(0, paper.w - COLUMN_INSET * 2);
  const cols = Math.max(1, Math.floor(columnWidth / charWidth));
  const stageWidth = paper.w + PAPER_MARGIN * 2;
  const column = laidOutLine !== null ? Math.min(laidOutLine.length, cols) : caretColumn(text, cols);
  const caretX = PAPER_MARGIN + COLUMN_INSET + column * charWidth;
  const caretOffset = Math.max(-(stageWidth / 2 - 48), Math.min(stageWidth / 2 - 48, caretX - stageWidth / 2));
  const slide = useCarriage(caretOffset);

  const railY = Math.max(150, Math.min(paper.h * 0.58, paper.h - FOOT - 40));

  const opening = capture ? capture.text : showStarter ? t.starters[starter] : null;
  const bottomPhrase = timeUp ? t.write.timeUp : phrase === null ? null : t.companion[phrase];

  return (
    <View style={{ flex: 1, backgroundColor: MACHINE.body }}>
      <StatusBar style="light" />
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {/* The machine's top: quiet controls in typewriter type, on the dark body. */}
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t.write.leave}
              hitSlop={10}
              onPress={() => setLeaving(true)}
              style={({ pressed }) => [styles.machineButton, { opacity: pressed ? 0.5 : 1 }]}>
              <Icon name="close" size={18} color={MACHINE.bodyText} />
            </Pressable>
            <View style={{ alignItems: 'center' }}>
              <T variant="typeSmall" style={{ color: MACHINE.bodyFaint, fontSize: 12 }}>
                {t.sessions[type].name.toLowerCase()}
              </T>
              <T variant="type" style={{ color: MACHINE.bodyText, fontSize: 15, lineHeight: 20 }}>
                {timeUp ? t.write.time : formatClock(remaining)}
              </T>
            </View>
            {sound !== 'none' ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={muted ? t.write.unmute : t.write.mute}
                hitSlop={10}
                onPress={() => setMuted((m) => !m)}
                style={({ pressed }) => [styles.machineButton, { opacity: pressed ? 0.5 : 1 }]}>
                <Icon name={muted ? 'soundOff' : 'sound'} size={18} color={MACHINE.bodyText} />
              </Pressable>
            ) : (
              <T variant="typeSmall" style={[styles.counter, { color: MACHINE.bodyFaint }]}>
                {t.common.words(words)}
              </T>
            )}
          </View>

          {/* The sheet of paper, rising out of the machine; the rail crosses it edge to edge. */}
          <View style={{ flex: 1 }}>
            <View
              style={[styles.paper, { backgroundColor: paperColor }]}
              onLayout={(e) => setPaper({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
              <PaperTexture tone={scheme === 'dark' ? 'chalk' : 'ink'} />

              {paper.h > 0 && (
                <>
                  {/* Everything typed sits above the rail and grows upward. */}
                  <View style={[styles.column, { bottom: paper.h - railY + 6 }]}>
                    <Animated.View style={feedStyle}>
                      {opening && !promptGone && (
                        <Animated.View exiting={FadeOut.duration(300)} style={styles.opening}>
                          <T variant="label">{capture ? t.write.captured : t.write.beginHere}</T>
                          <View style={styles.openingRow}>
                            <View style={{ flex: 1 }}>
                              <Dissolve
                                key={opening}
                                text={opening}
                                go={started}
                                onDone={() => setPromptGone(true)}
                                variant="italic"
                                style={{ fontSize: 22, lineHeight: 30 }}
                              />
                            </View>
                            {!capture && !started && (
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
                      {/* Invisible mirrors: one measures the text's wrapped height, one the width of a character. */}
                      <View pointerEvents="none" style={styles.mirrorBox}>
                        <Text
                          style={[styles.input, styles.mirror]}
                          onLayout={(e) => onMeasured(e.nativeEvent.layout.height)}
                          onTextLayout={(e) => {
                            const lines = e.nativeEvent.lines;
                            const last = lines.length ? lines[lines.length - 1].text : '';
                            // Drop the placeholder space the mirror adds after an empty or finished line.
                            const padded = text === '' || text.endsWith('\n');
                            setLaidOutLine((padded ? last.slice(0, -1) : last).replace(/\n$/, ''));
                          }}>
                          {text.endsWith('\n') || text === '' ? `${text} ` : text}
                        </Text>
                        {/* Sized to its content (no right edge), so its width is twenty characters. */}
                        <Text
                          style={[styles.input, styles.charMirror]}
                          onLayout={(e) => e.nativeEvent.layout.width > 0 && setCharWidth(e.nativeEvent.layout.width / 20)}>
                          {'00000000000000000000'}
                        </Text>
                      </View>
                      <TextInput
                        value={text}
                        onChangeText={onChange}
                        multiline
                        autoFocus
                        scrollEnabled={false}
                        textAlignVertical="top"
                        placeholder={t.write.placeholder}
                        placeholderTextColor={c.inkFaint}
                        selectionColor={c.accent}
                        style={[styles.input, { color: c.ink, height: inputHeight }]}
                      />
                    </Animated.View>
                  </View>

                  {/* Old lines fade as they are fed up into the machine. */}
                  <View pointerEvents="none" style={styles.topFade}>
                    <Svg width={paper.w} height={72}>
                      <Defs>
                        <LinearGradient id="paper-top" x1="0" y1="0" x2="0" y2="1">
                          <Stop offset="0" stopColor={paperColor} stopOpacity={1} />
                          <Stop offset="1" stopColor={paperColor} stopOpacity={0} />
                        </LinearGradient>
                      </Defs>
                      <Rect x={0} y={0} width={paper.w} height={72} fill="url(#paper-top)" />
                    </Svg>
                  </View>

                  <View style={styles.foot}>
                    <View style={styles.phraseSlot}>
                      <CrossfadeText text={bottomPhrase} />
                    </View>
                    <View style={styles.actions}>
                      <T variant="typeSmall" tone="faint">
                        {sound !== 'none' ? t.common.words(words) : ''}
                      </T>
                      <PillButton
                        title={t.write.finish}
                        kind={timeUp ? 'primary' : 'secondary'}
                        onPress={finish}
                        disabled={!text.trim()}
                        style={{ height: 42 }}
                      />
                    </View>
                  </View>
                </>
              )}
            </View>
            {paper.h > 0 && (
              <View pointerEvents="none" style={[styles.railRow, { top: railY }]}>
                <Rail
                  progress={Math.min(1, elapsed / planned)}
                  timeUp={timeUp}
                  strike={strike}
                  slide={slide}
                />
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

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
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.gutter,
    height: 64,
  },
  machineButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  counter: { minWidth: 40, textAlign: 'right', fontSize: 12 },
  paper: {
    flex: 1,
    marginHorizontal: 10,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  column: { position: 'absolute', left: COLUMN_INSET, right: COLUMN_INSET },
  mirrorBox: { position: 'absolute', left: 0, right: 0, top: 0, opacity: 0 },
  mirror: { position: 'absolute', left: 0, right: 0 },
  charMirror: { position: 'absolute', left: 0 },
  opening: { marginBottom: space.lg, gap: space.sm },
  openingRow: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  input: {
    fontFamily: fonts.type,
    fontSize: FONT_SIZE,
    lineHeight: LINE,
    padding: 0,
  },
  topFade: { position: 'absolute', top: 0, left: 0 },
  railRow: { position: 'absolute', left: 0, right: 0 },
  foot: { position: 'absolute', left: 22, right: 22, bottom: 14 },
  phraseSlot: { minHeight: 26, justifyContent: 'center', marginBottom: 8 },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
