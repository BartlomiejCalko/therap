import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
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
import { FontPopover, WRITING_FONTS, WritingSettings, type WritingPrefs } from '@/components/WritingSettings';
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

const LINE = 32;
const HEADER_HEIGHT = 60;
// The paper fills the screen; this is where a line of text starts from its edge.
const COLUMN_INSET = 20;

// The last line as a greedy word wrap at `cols` characters would draw it. Only a fallback for
// web, where the text field does not report its lines; native platforms give the real line.
function lastWrappedLine(text: string, cols: number) {
  const paragraph = text.split('\n').pop() ?? '';
  let line = '';
  for (const word of paragraph.split(' ')) {
    const candidate = line === '' ? word : `${line} ${word}`;
    if (candidate.length <= cols) line = candidate;
    else line = word.length > cols ? word.slice(word.length - (word.length % cols || cols)) : word;
  }
  return line;
}
// A short run of ordinary text (short enough never to wrap) for an average character width.
const SAMPLE = 'quiet pages hold it';
// Space kept on the paper below the rail for the companion phrase and, once time is up, Finish.
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
  const { updateSettings } = useStore();

  // Typeface, sound and phrases: taken from the session, changeable from the settings popup,
  // and every change is remembered for the sessions after this one.
  const [prefs, setPrefs] = useState<WritingPrefs>(() => ({
    font: data.settings.writingFont,
    sound: params.sound ?? 'none',
    companion: params.companion === '1',
  }));
  const { sound, companion } = prefs;
  const face = WRITING_FONTS[prefs.font];
  // Before the very first session the settings open on their own.
  const [settingsOpen, setSettingsOpen] = useState(() => !data.settings.writingSetUp);
  const [fontOpen, setFontOpen] = useState(false);
  // Where the "Aa" button sits in the header, so the font bubble can hang right under it.
  const [toolsX, setToolsX] = useState(0);
  const [fontButtonX, setFontButtonX] = useState(0);
  const inputRef = useRef<TextInput>(null);

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
  // Measured from hidden mirrors of the text: the field's real height, an average character
  // width (for the web fallback) and the drawn width of the line being typed.
  const [charWidth, setCharWidth] = useState(10);
  const [lineWidth, setLineWidth] = useState(0);
  // The last line exactly as the system wrapped it (iOS/Android report this; web does not).
  const [laidOutLine, setLaidOutLine] = useState<string | null>(null);
  const feed = useSharedValue(0);
  const feedStyle = useAnimatedStyle(() => ({ transform: [{ translateY: feed.value }] }));
  const paperColor = MACHINE.paper[scheme];
  const dark = scheme === 'dark';

  // Quiet while the settings are open, so a sample there is heard on its own.
  useFocusSound(sound, muted || settingsOpen);

  const planned = minutes * 60;
  const elapsed = (now - startedAt) / 1000;
  const remaining = planned - elapsed;
  const timeUp = remaining <= 0;

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

  // The capsule rides under the caret, like a typewriter carriage: the current line is drawn
  // once more, invisibly, in the same face, and its width says where the caret is.
  const columnWidth = Math.max(0, paper.w - COLUMN_INSET * 2);
  const cols = Math.max(1, Math.floor(columnWidth / charWidth));
  const currentLine = laidOutLine ?? lastWrappedLine(text, cols);
  const caretX = COLUMN_INSET + Math.min(lineWidth, columnWidth);
  const caretOffset = Math.max(-(paper.w / 2 - 48), Math.min(paper.w / 2 - 48, caretX - paper.w / 2));
  const slide = useCarriage(caretOffset);

  const changePrefs = (patch: Partial<WritingPrefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    if (patch.sound && patch.sound !== 'none') setMuted(false);
    updateSettings({
      writingFont: next.font,
      defaults: { ...data.settings.defaults, sound: next.sound, companion: next.companion },
    });
  };
  const openSettings = () => {
    tap();
    Keyboard.dismiss();
    setSettingsOpen(true);
  };
  const closeSettings = () => {
    setSettingsOpen(false);
    if (!data.settings.writingSetUp) updateSettings({ writingSetUp: true });
    // Back to the page, ready to type.
    setTimeout(() => inputRef.current?.focus(), 350);
  };
  const inputFace = { fontFamily: face.family, fontSize: face.size };

  const railY = Math.max(150, Math.min(paper.h * 0.58, paper.h - FOOT - 40));

  const opening = capture ? capture.text : showStarter ? t.starters[starter] : null;
  const bottomPhrase = timeUp ? t.write.timeUp : phrase === null ? null : t.companion[phrase];

  const iconColor = c.inkSoft;

  return (
    <View style={{ flex: 1, backgroundColor: paperColor }}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      {/* The whole screen is the sheet of paper: nothing boxes the writing in. */}
      <PaperTexture tone={dark ? 'chalk' : 'ink'} />
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t.write.leave}
              hitSlop={10}
              onPress={() => setLeaving(true)}
              style={({ pressed }) => [styles.button, { backgroundColor: c.veil, opacity: pressed ? 0.5 : 1 }]}>
              <Icon name="close" size={18} color={iconColor} />
            </Pressable>

            {/* Session name and the time left, centred over the page. */}
            <View pointerEvents="none" style={styles.title}>
              <T variant="serif" style={{ fontSize: 17, lineHeight: 22 }}>
                {t.sessions[type].name}
              </T>
              <T variant="small" tone="faint" style={styles.clock}>
                {timeUp ? t.write.time : formatClock(remaining)}
              </T>
            </View>

            <View style={styles.tools} onLayout={(e) => setToolsX(e.nativeEvent.layout.x)}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t.write.fontA11y(t.write.fonts[prefs.font])}
                hitSlop={6}
                onPress={() => {
                  tap();
                  Keyboard.dismiss();
                  setFontOpen((open) => !open);
                }}
                onLayout={(e) => setFontButtonX(e.nativeEvent.layout.x + e.nativeEvent.layout.width / 2)}
                style={({ pressed }) => [styles.button, { opacity: pressed ? 0.5 : 1 }]}>
                <Text style={{ fontFamily: face.family, fontSize: 17, color: iconColor }}>Aa</Text>
              </Pressable>
              {sound !== 'none' && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={muted ? t.write.unmute : t.write.mute}
                  hitSlop={6}
                  onPress={() => {
                    tap();
                    setMuted((m) => !m);
                  }}
                  style={({ pressed }) => [styles.button, { opacity: pressed ? 0.5 : 1 }]}>
                  <Icon name={muted ? 'soundOff' : 'sound'} size={19} color={iconColor} />
                </Pressable>
              )}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t.write.settingsTitle}
                hitSlop={6}
                onPress={openSettings}
                style={({ pressed }) => [styles.button, { opacity: pressed ? 0.5 : 1 }]}>
                <Icon name="settings" size={19} color={iconColor} />
              </Pressable>
            </View>
          </View>

          {/* The writing area clips what is fed up past its top, so old lines never reach the header. */}
          <View
            style={styles.page}
            onLayout={(e) => setPaper({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
            {paper.h > 0 && (
              <>
                {/* Everything typed sits above the rail and grows upward. */}
                <View style={[styles.column, { bottom: paper.h - railY + 8 }]}>
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
                    {/* Invisible mirrors: the text's wrapped height, an average character, the current line. */}
                    <View pointerEvents="none" style={styles.mirrorBox}>
                      <Text
                        style={[styles.input, inputFace, styles.mirror]}
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
                      {/* Sized to their content (no right edge), so their widths can be read. */}
                      <Text
                        style={[styles.input, inputFace, styles.sizeMirror]}
                        onLayout={(e) => {
                          const sample = prefs.font === 'mono' ? 20 : SAMPLE.length;
                          if (e.nativeEvent.layout.width > 0) setCharWidth(e.nativeEvent.layout.width / sample);
                        }}>
                        {prefs.font === 'mono' ? '00000000000000000000' : SAMPLE}
                      </Text>
                      <Text
                        style={[styles.input, inputFace, styles.sizeMirror]}
                        onLayout={(e) => setLineWidth(currentLine ? e.nativeEvent.layout.width : 0)}>
                        {/* Spaces kept visible to the measure: a trailing space still moves the caret. */}
                        {currentLine.replace(/ /g, ' ')}
                      </Text>
                    </View>
                    <TextInput
                      ref={inputRef}
                      value={text}
                      onChangeText={onChange}
                      multiline
                      autoFocus={!settingsOpen}
                      scrollEnabled={false}
                      textAlignVertical="top"
                      placeholder={t.write.placeholder}
                      placeholderTextColor={c.inkFaint}
                      selectionColor={c.accent}
                      style={[styles.input, inputFace, { color: c.ink, height: inputHeight }]}
                    />
                  </Animated.View>
                </View>

                {/* Old lines fade as they are fed up towards the top of the page. */}
                <View pointerEvents="none" style={styles.topFade}>
                  <Svg width={paper.w} height={88}>
                    <Defs>
                      <LinearGradient id="paper-top" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor={paperColor} stopOpacity={1} />
                        <Stop offset="1" stopColor={paperColor} stopOpacity={0} />
                      </LinearGradient>
                    </Defs>
                    <Rect x={0} y={0} width={paper.w} height={88} fill="url(#paper-top)" />
                  </Svg>
                </View>

                <View pointerEvents="none" style={[styles.railRow, { top: railY }]}>
                  <Rail progress={Math.min(1, elapsed / planned)} timeUp={timeUp} strike={strike} slide={slide} />
                </View>

                <View style={styles.foot}>
                  <View style={styles.phraseSlot}>{companion && <CrossfadeText text={bottomPhrase} />}</View>
                  {!companion && timeUp && (
                    <T variant="italic" tone="soft" center style={{ marginBottom: space.sm }}>
                      {t.write.timeUp}
                    </T>
                  )}
                  {/* No Finish while the time runs: nothing should invite leaving early.
                      Ending before time stays possible through the close button. */}
                  {timeUp && (
                    <View style={{ alignItems: 'flex-end' }}>
                      <PillButton title={t.write.finish} onPress={finish} disabled={!text.trim()} style={{ height: 44 }} />
                    </View>
                  )}
                </View>
              </>
            )}
          </View>

          <FontPopover
            visible={fontOpen}
            font={prefs.font}
            anchorX={toolsX + fontButtonX}
            top={HEADER_HEIGHT - 2}
            onPick={(font) => changePrefs({ font })}
            onClose={() => {
              setFontOpen(false);
              setTimeout(() => inputRef.current?.focus(), 250);
            }}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>

      <WritingSettings visible={settingsOpen} prefs={prefs} onChange={changePrefs} onClose={closeSettings} />
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
    paddingHorizontal: space.md,
    height: HEADER_HEIGHT,
  },
  button: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  clock: { fontVariant: ['tabular-nums'], marginTop: 1 },
  tools: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  page: { flex: 1, overflow: 'hidden' },
  column: { position: 'absolute', left: COLUMN_INSET, right: COLUMN_INSET },
  mirrorBox: { position: 'absolute', left: 0, right: 0, top: 0, opacity: 0 },
  mirror: { position: 'absolute', left: 0, right: 0 },
  sizeMirror: { position: 'absolute', left: 0 },
  opening: { marginBottom: space.lg, gap: space.sm },
  openingRow: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  input: {
    fontFamily: fonts.typewriter,
    lineHeight: LINE,
    padding: 0,
  },
  topFade: { position: 'absolute', top: 0, left: 0 },
  railRow: { position: 'absolute', left: 0, right: 0 },
  foot: { position: 'absolute', left: COLUMN_INSET, right: COLUMN_INSET, bottom: 18 },
  phraseSlot: { minHeight: 26, justifyContent: 'center', marginBottom: 8 },
});
