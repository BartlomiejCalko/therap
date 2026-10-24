import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View, type TextInputInstance } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, Line, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { CrossfadeText } from '@/components/CrossfadeText';
import { Icon } from '@/components/Icon';
import { MACHINE, RAIL_SPACE, Rail, useCarriage } from '@/components/Machine';
import { PaperTexture } from '@/components/PaperTexture';
import { Dissolve } from '@/components/motion';
import { T } from '@/components/T';
import { ChoicePopover, useFontOptions, WRITING_FONTS, WritingSettings, type WritingPrefs } from '@/components/WritingSettings';
import { PillButton, Sheet } from '@/components/ui';
import { isSessionType, sessionMinutes, SOUNDS, type SessionType, type SoundId } from '@/content/copy';
import { useT } from '@/i18n';
import { formatClock, wordCount } from '@/lib/date';
import { followEdit, splitRuns, startFont, type FontRun } from '@/lib/fontRuns';
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
// The extra time, past the session's length.
const OVERTIME = { light: '#3F6148', dark: '#9DB49A' };
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
  // Which header bubble is open, and where its icon sits, so the bubble can hang right under it.
  const [popover, setPopover] = useState<'font' | 'sound' | null>(null);
  const [toolsX, setToolsX] = useState(0);
  const [anchors, setAnchors] = useState({ font: 0, sound: 0, companion: 0 });
  // A short note under the phrases toggle, saying what the tap just did.
  const [companionNote, setCompanionNote] = useState<string | null>(null);
  const noteTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const fontOptions = useFontOptions();
  const inputRef = useRef<TextInputInstance>(null);

  const [text, setText] = useState('');
  // Which face each part of the text was written in; a face change applies from the caret on.
  const [runs, setRuns] = useState<FontRun[]>(() => [{ at: 0, font: data.settings.writingFont }]);
  const caret = useRef(0);
  // Chosen when the time is up: keep writing, and the extra time is counted and saved.
  const [extended, setExtended] = useState(false);
  const [started, setStarted] = useState(false);
  // The prompt stays on the page while its words drift away, then makes room.
  const [promptGone, setPromptGone] = useState(false);
  const tickedAt = useRef(0);
  const [starter, setStarter] = useState(() => pickIndex(t.starters.length));
  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
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

  // Quiet while the first-time settings are open, so a sample there is heard on its own.
  useFocusSound(sound, settingsOpen);

  const planned = minutes * 60;
  const elapsed = (now - startedAt) / 1000;
  const timeUp = elapsed >= planned;
  const overtime = Math.max(0, elapsed - planned);
  // Time is up and the person has not chosen to keep going: the page is closed.
  const closed = timeUp && !extended;
  // The machine: rail, capsule and carriage belong to the typewriter face only.
  const machine = prefs.font === 'mono';

  // When the time is up the page closes: no more typing, only finishing or keeping going.
  useEffect(() => {
    if (!closed) return;
    Keyboard.dismiss();
    setPopover(null);
  }, [closed]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (timeUp && !notified.current) {
      notified.current = true;
      done();
    }
    if (!companion || closed || !started) return;
    const paused = now - typedAt.current > PAUSE_MS;
    // One phrase per pause, otherwise a slow rotation while the writing flows.
    if ((paused && !answeredPause.current) || now - phraseAt.current > PHRASE_EVERY_MS) {
      if (paused) answeredPause.current = true;
      phraseAt.current = now;
      setPhrase((p) => pickIndex(t.companion.length, p));
    }
  }, [now, timeUp, closed, companion, started, t.companion.length]);

  const onChange = (value: string) => {
    // A soft tick at the end of each word, like a typewriter carriage — never more than one per 70 ms.
    const last = value[value.length - 1];
    if (value.length > text.length && (last === ' ' || last === '\n') && Date.now() - tickedAt.current > 70) {
      tickedAt.current = Date.now();
      tap();
    }
    if (value.length > text.length) setStrike((n) => n + 1);
    // An emptied page starts over in the face that is chosen now.
    setRuns((r) => (value === '' ? [{ at: 0, font: prefs.font }] : followEdit(r, text, value)));
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
      extendedSeconds: extended ? Math.round(overtime) : undefined,
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
    // A new face starts where the caret is; what is already written keeps its own.
    if (patch.font && patch.font !== prefs.font) {
      setRuns((r) => startFont(r, Math.min(caret.current, text.length), patch.font!, text.length));
    }
    updateSettings({
      writingFont: next.font,
      defaults: { ...data.settings.defaults, sound: next.sound, companion: next.companion },
    });
  };
  const openPopover = (which: 'font' | 'sound') => {
    tap();
    Keyboard.dismiss();
    setPopover((open) => (open === which ? null : which));
  };
  const closePopover = () => {
    setPopover(null);
    if (!closed) setTimeout(() => inputRef.current?.focus(), 250);
  };
  const toggleCompanion = () => {
    tap();
    const on = !companion;
    changePrefs({ companion: on });
    setCompanionNote(on ? t.write.companionOn : t.write.companionOff);
    clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => setCompanionNote(null), 1600);
  };
  const soundOptions = SOUNDS.map((id) => ({ value: id, label: t.sounds[id] }));
  const anchorAt = (key: keyof typeof anchors) => (e: { nativeEvent: { layout: { x: number; width: number } } }) => {
    const x = e.nativeEvent.layout.x + e.nativeEvent.layout.width / 2;
    setAnchors((a) => (a[key] === x ? a : { ...a, [key]: x }));
  };
  const closeSettings = () => {
    setSettingsOpen(false);
    if (!data.settings.writingSetUp) updateSettings({ writingSetUp: true });
    // Back to the page, ready to type.
    setTimeout(() => inputRef.current?.focus(), 350);
  };
  const inputFace = { fontFamily: face.family, fontSize: face.size };
  // The text drawn piece by piece, each piece in the face it was written in.
  const pieces = splitRuns(text, runs).map((piece, i) => (
    <Text key={i} style={{ fontFamily: WRITING_FONTS[piece.font].family, fontSize: WRITING_FONTS[piece.font].size }}>
      {piece.text}
    </Text>
  ));
  const keepWriting = () => {
    tap();
    setExtended(true);
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  const railY = Math.max(150, Math.min(paper.h * 0.58, paper.h - FOOT - 40));

  const opening = capture ? capture.text : showStarter ? t.starters[starter] : null;
  const bottomPhrase = phrase === null ? null : t.companion[phrase];

  const iconColor = c.inkSoft;

  return (
    <View style={{ flex: 1, backgroundColor: paperColor }}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      {/* The whole screen is the sheet of paper: nothing boxes the writing in. */}
      <PaperTexture tone={dark ? 'chalk' : 'ink'} />
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.header}>
            <View style={styles.side}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t.write.leave}
                hitSlop={10}
                onPress={() => setLeaving(true)}
                style={({ pressed }) => [styles.button, { backgroundColor: c.veil, opacity: pressed ? 0.5 : 1 }]}>
                <Icon name="close" size={18} color={iconColor} />
              </Pressable>
            </View>

            {/* In the middle, the three things worth changing mid-session: face, sound, phrases. */}
            <View style={[styles.tools, closed && { opacity: 0.3 }]} onLayout={(e) => setToolsX(e.nativeEvent.layout.x)}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t.write.fontA11y(t.write.fonts[prefs.font])}
                hitSlop={6}
                disabled={closed}
                onPress={() => openPopover('font')}
                onLayout={anchorAt('font')}
                style={({ pressed }) => [styles.button, { opacity: pressed ? 0.5 : 1 }]}>
                <Text style={{ fontFamily: face.family, fontSize: 17, color: iconColor }}>Aa</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t.write.soundA11y(t.sounds[sound])}
                hitSlop={6}
                disabled={closed}
                onPress={() => openPopover('sound')}
                onLayout={anchorAt('sound')}
                style={({ pressed }) => [styles.button, { opacity: pressed ? 0.5 : 1 }]}>
                <Icon name={sound === 'none' ? 'soundOff' : 'sound'} size={19} color={iconColor} />
              </Pressable>
              <Pressable
                accessibilityRole="switch"
                accessibilityLabel={t.write.companion}
                accessibilityState={{ checked: companion }}
                hitSlop={6}
                disabled={closed}
                onPress={toggleCompanion}
                onLayout={anchorAt('companion')}
                style={({ pressed }) => [styles.button, { opacity: pressed ? 0.5 : 1 }]}>
                <PhrasesIcon on={companion} color={iconColor} />
              </Pressable>
            </View>

            <View style={[styles.side, { alignItems: 'flex-end' }]}>
              {/* Time counts up to the session's length; past it, the extra time shows in green. */}
              <T variant="small" style={[styles.clock, { color: c.ink }]}>
                {formatClock(Math.min(elapsed, planned))}
              </T>
              {timeUp && overtime >= 1 && (
                <T variant="small" style={[styles.overtime, { color: dark ? OVERTIME.dark : OVERTIME.light }]}>
                  +{formatClock(overtime)}
                </T>
              )}
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
                        {pieces}
                        {text.endsWith('\n') || text === '' ? ' ' : null}
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
                      // Native fields draw nested Text, so each piece keeps its own face; the web
                      // field is a plain textarea and shows the text in the current face.
                      {...(Platform.OS === 'web' ? { value: text } : { children: pieces })}
                      onChangeText={onChange}
                      onSelectionChange={(e) => {
                        caret.current = e.nativeEvent.selection.end;
                      }}
                      multiline
                      autoFocus={!settingsOpen}
                      editable={!closed}
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

                {machine ? (
                  <View pointerEvents="none" style={[styles.railRow, { top: railY }]}>
                    <Rail progress={Math.min(1, elapsed / planned)} timeUp={timeUp} strike={strike} slide={slide} />
                  </View>
                ) : (
                  // Without the machine the page keeps one quiet guide: a hairline under the
                  // writing line that slowly fills as the session's time passes.
                  <View pointerEvents="none" style={[styles.guideRow, { top: railY + RAIL_SPACE / 2 }]}>
                    <View style={[styles.guideTrack, { backgroundColor: c.hairline }]}>
                      <View
                        style={[
                          styles.guideFill,
                          { width: `${Math.min(1, elapsed / planned) * 100}%`, backgroundColor: c.gold },
                        ]}
                      />
                    </View>
                  </View>
                )}

                {!closed && (
                  <View pointerEvents="box-none" style={styles.foot}>
                    <View pointerEvents="none" style={styles.phraseSlot}>
                      {companion && <CrossfadeText text={bottomPhrase} />}
                    </View>
                    {/* Writing on past the time: finishing is one quiet tap away. */}
                    {extended && (
                      <Animated.View entering={FadeIn.duration(300)} style={{ alignItems: 'flex-end' }}>
                        <PillButton
                          title={t.write.finishSession}
                          kind="secondary"
                          onPress={finish}
                          style={{ height: 42 }}
                        />
                      </Animated.View>
                    )}
                  </View>
                )}

                {/* Time is up: the page closes and says so plainly. Finish, or keep going. */}
                {closed && (
                  <Animated.View
                    entering={FadeInDown.duration(420)}
                    style={[styles.endCard, { backgroundColor: c.surface, borderColor: c.hairline, shadowColor: c.shadow }]}>
                    <T variant="title" center>
                      {t.write.timeUpTitle}
                    </T>
                    <T variant="body" tone="soft" center style={{ marginTop: space.xs }}>
                      {t.write.timeUpBody}
                    </T>
                    <PillButton
                      title={text.trim() ? t.write.finishSession : t.write.leaveEmpty}
                      icon="arrow"
                      onPress={finish}
                      style={{ marginTop: space.lg, alignSelf: 'stretch' }}
                    />
                    <PillButton
                      title={t.write.keepWriting}
                      kind="ghost"
                      onPress={keepWriting}
                      style={{ marginTop: 4, alignSelf: 'stretch' }}
                    />
                  </Animated.View>
                )}
              </>
            )}
          </View>

          <ChoicePopover
            visible={popover === 'font'}
            options={fontOptions}
            value={prefs.font}
            anchorX={toolsX + anchors.font}
            top={HEADER_HEIGHT - 2}
            onPick={(font) => changePrefs({ font })}
            onClose={closePopover}
          />
          <ChoicePopover
            visible={popover === 'sound'}
            options={soundOptions}
            value={sound}
            anchorX={toolsX + anchors.sound}
            top={HEADER_HEIGHT - 2}
            onPick={(id: SoundId) => changePrefs({ sound: id })}
            onClose={closePopover}
          />
          {companionNote && (
            <Animated.View
              pointerEvents="none"
              entering={FadeIn.duration(160)}
              exiting={FadeOut.duration(200)}
              style={[
                styles.note,
                { top: HEADER_HEIGHT - 2, left: toolsX + anchors.companion - 110, backgroundColor: c.ink },
              ]}>
              <T variant="small" center style={{ color: c.onInk }}>
                {companionNote}
              </T>
            </Animated.View>
          )}
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
  // Equal sides keep the three controls truly centred.
  side: { width: 64 },
  // A touch smaller and softer than ink, so the time is there without asking to be watched.
  clock: { fontVariant: ['tabular-nums'], fontSize: 13, lineHeight: 17, opacity: 0.78 },
  overtime: { fontVariant: ['tabular-nums'], fontSize: 12, lineHeight: 15 },
  tools: { flexDirection: 'row', alignItems: 'center', gap: 6 },
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
  guideRow: { position: 'absolute', left: COLUMN_INSET, right: COLUMN_INSET },
  guideTrack: { height: 1, borderRadius: 1, overflow: 'hidden' },
  guideFill: { height: 1 },
  endCard: {
    position: 'absolute',
    left: space.md,
    right: space.md,
    bottom: space.lg,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
    paddingBottom: space.md,
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  note: { position: 'absolute', width: 220, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12 },
  foot: { position: 'absolute', left: COLUMN_INSET, right: COLUMN_INSET, bottom: 18 },
  phraseSlot: { minHeight: 26, justifyContent: 'center', marginBottom: 8 },
});

// Supportive phrases: a small speech bubble with two lines of text, crossed out when off.
function PhrasesIcon({ on, color }: { on: boolean; color: string }) {
  const p = { stroke: color, strokeWidth: 1.4, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <Svg width={21} height={21} viewBox="0 0 24 24">
      <Path d="M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5h-8l-4 3.2v-3.2H5A1.5 1.5 0 0 1 3.5 15V7A1.5 1.5 0 0 1 5 5.5z" {...p} />
      <Line x1={7.5} y1={9.5} x2={16.5} y2={9.5} {...p} />
      <Line x1={7.5} y1={12.5} x2={13} y2={12.5} {...p} />
      {!on && <Line x1={4} y1={4} x2={20.5} y2={20.5} {...p} />}
    </Svg>
  );
}
