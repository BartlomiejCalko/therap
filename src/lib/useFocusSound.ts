import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { useEffect } from 'react';

import type { SoundId } from '@/content/copy';

import { SOUND_FILES } from './sounds';

// Loops a focus sound for as long as the calling screen is mounted.
export function useFocusSound(id: SoundId, muted: boolean) {
  const player = useAudioPlayer(id === 'none' ? null : SOUND_FILES[id]);

  useEffect(() => {
    if (id === 'none') return;
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
    player.loop = true;
    player.volume = 0.5;
  }, [player, id]);

  useEffect(() => {
    if (id === 'none') return;
    if (muted) player.pause();
    else player.play();
  }, [muted, player, id]);
}
