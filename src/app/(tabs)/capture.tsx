import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { CaptureCard, estimateCapture } from '@/components/Cards';
import { T } from '@/components/T';
import { Chip, Masonry, PillButton, Screen, SectionLabel, Sheet } from '@/components/ui';
import { dayLabel, groupByDay } from '@/lib/date';
import { done } from '@/lib/haptics';
import { useStore } from '@/store/store';
import type { Capture } from '@/store/types';
import { useTheme } from '@/theme/theme';
import { fonts, radius, space } from '@/theme/tokens';

type Filter = 'all' | 'waiting' | 'explored';
const MAX = 280;

export default function CaptureTab() {
  const { c } = useTheme();
  const { data, addCapture, deleteCapture } = useStore();
  const [draft, setDraft] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [menu, setMenu] = useState<Capture | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  const list = data.captures.filter((x) => filter === 'all' || x.status === filter);
  const groups = groupByDay(list, (x) => x.createdAt);
  const unload = (capture: Capture) => router.push({ pathname: '/choose', params: { captureId: capture.id } });

  const save = () => {
    if (!draft.trim()) return;
    addCapture(draft);
    setDraft('');
    done();
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1800);
  };

  return (
    <Screen withTabBar contentStyle={{ paddingTop: space.lg }}>
      <T variant="title" center>
        Capture
      </T>
      <T variant="small" tone="faint" center style={{ marginTop: space.xs, paddingHorizontal: space.lg }}>
        Save a thought before it slips away. Come back to it when you&apos;re ready to explore it further.
      </T>

      <View style={[styles.composer, { backgroundColor: c.surface, borderColor: c.hairline }]}>
        <T variant="label">Write one thought or sentence</T>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          multiline
          maxLength={MAX}
          placeholder="It keeps coming back that…"
          placeholderTextColor={c.inkFaint}
          style={[styles.input, { color: c.ink }]}
        />
        <View style={styles.composerFoot}>
          <T variant="label" tone={savedFlash ? 'ink' : 'faint'}>
            {savedFlash ? 'Saved for later' : `${draft.length} / ${MAX}`}
          </T>
          <PillButton title="Save" onPress={save} disabled={!draft.trim()} style={{ height: 40 }} />
        </View>
      </View>

      <SectionLabel>For later</SectionLabel>
      <View style={styles.filters}>
        {(['all', 'waiting', 'explored'] as Filter[]).map((f) => (
          <Chip
            key={f}
            size="sm"
            label={f === 'all' ? 'All' : f === 'waiting' ? 'Waiting' : 'Explored'}
            selected={filter === f}
            onPress={() => setFilter(f)}
          />
        ))}
      </View>

      {groups.length === 0 ? (
        <T variant="italic" tone="faint" center style={{ marginTop: space.xl, fontSize: 17 }}>
          Nothing here yet.
        </T>
      ) : (
        groups.map((g) => (
          <View key={g.key} style={{ marginTop: space.lg }}>
            <T variant="heading" style={{ marginBottom: space.md }}>
              {dayLabel(g.time)}
            </T>
            <Masonry
              items={g.items}
              estimate={estimateCapture}
              renderItem={(capture) => (
                <CaptureCard
                  key={capture.id}
                  capture={capture}
                  onUnload={() => unload(capture)}
                  onMore={() => setMenu(capture)}
                />
              )}
            />
          </View>
        ))
      )}

      <Sheet visible={!!menu} onClose={() => setMenu(null)} title="This thought">
        {menu && (
          <View style={{ gap: 10 }}>
            <T variant="italic" center style={{ marginBottom: space.md }}>
              {menu.text}
            </T>
            {menu.status === 'waiting' && (
              <PillButton
                title="Unload this"
                icon="arrow"
                onPress={() => {
                  const target = menu;
                  setMenu(null);
                  unload(target);
                }}
              />
            )}
            <PillButton
              title="Delete"
              kind="secondary"
              onPress={() => {
                deleteCapture(menu.id);
                setMenu(null);
              }}
            />
          </View>
        )}
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  composer: {
    marginTop: space.xl,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: space.md,
  },
  input: {
    fontFamily: fonts.serif,
    fontSize: 20,
    lineHeight: 28,
    minHeight: 84,
    paddingVertical: space.sm,
    textAlignVertical: 'top',
  },
  composerFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  filters: { flexDirection: 'row', gap: space.sm },
});
