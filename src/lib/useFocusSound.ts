import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { useEffect, useRef, useState } from 'react';

import type { SoundId } from '@/content/copy';

import { SOUND_FILES } from './sounds';

const VOLUME = 0.5;

// Loops a focus sound for as long as the calling screen is mounted. One player is kept and
// its track swapped when the choice changes, so a new sound starts straight away.
export function useFocusSound(id: SoundId, muted: boolean) {
  const player = useAudioPlayer(null);

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  useEffect(() => {
    if (id === 'none') {
      player.pause();
      return;
    }
    player.replace(SOUND_FILES[id]);
    player.loop = true;
    player.volume = VOLUME;
  }, [player, id]);

  useEffect(() => {
    if (id === 'none') return;
    if (muted) player.pause();
    else player.play();
  }, [muted, player, id]);
}

const SAMPLE_MS = 6000;
const FADE_MS = 1500;

// A short sample of a sound, fading out at the end, so a choice can be heard before it is made.
export function useSoundPreview() {
  const player = useAudioPlayer(null);
  const [playing, setPlaying] = useState<SoundId | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const stop = () => {
    clear();
    player.pause();
    setPlaying(null);
  };

  const preview = (id: SoundId) => {
    clear();
    if (id === 'none') {
      player.pause();
      setPlaying(null);
      return;
    }
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
    player.replace(SOUND_FILES[id]);
    player.loop = true;
    player.volume = VOLUME;
    player.play();
    setPlaying(id);
    // Ten small steps down to silence over the last moments of the sample.
    const steps = 10;
    for (let i = 1; i <= steps; i++) {
      timers.current.push(
        setTimeout(() => {
          player.volume = VOLUME * (1 - i / steps);
        }, SAMPLE_MS - FADE_MS + (FADE_MS / steps) * i),
      );
    }
    timers.current.push(setTimeout(stop, SAMPLE_MS + 50));
  };

  // Never outlive the screen that started it.
  useEffect(() => () => clear(), []);

  return { preview, stop, playing };
}
