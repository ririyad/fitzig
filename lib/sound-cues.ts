import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';

export type SoundCueKind = 'exercise' | 'cooldown' | 'complete';

const CUE_SOURCES: Record<SoundCueKind, number> = {
  exercise: require('@/assets/sounds/transition-exercise.wav'),
  cooldown: require('@/assets/sounds/transition-cooldown.wav'),
  complete: require('@/assets/sounds/session-complete.wav'),
};

const PLAY_DEBOUNCE_MS = 220;

let isSoundEnabled = false;
let initialized = false;
let initPromise: Promise<void> | null = null;
const loadedSounds: Partial<Record<SoundCueKind, Audio.Sound>> = {};
const lastPlayedAt: Record<SoundCueKind, number> = {
  exercise: 0,
  cooldown: 0,
  complete: 0,
};

async function ensureInitialized() {
  if (initialized) return;
  if (initPromise) {
    await initPromise;
    return;
  }

  initPromise = (async () => {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: false,
      interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
      interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
      shouldDuckAndroid: true,
      staysActiveInBackground: false,
      playThroughEarpieceAndroid: false,
    });

    await Promise.all(
      (Object.keys(CUE_SOURCES) as SoundCueKind[]).map(async (kind) => {
        const { sound } = await Audio.Sound.createAsync(CUE_SOURCES[kind], {
          shouldPlay: false,
          volume: 1,
        });
        loadedSounds[kind] = sound;
      })
    );

    initialized = true;
  })();

  try {
    await initPromise;
  } finally {
    initPromise = null;
  }
}

export function setSoundEnabled(enabled: boolean) {
  isSoundEnabled = enabled;
}

export async function initSoundCues() {
  try {
    await ensureInitialized();
  } catch {
    // Best-effort initialization; run flow should continue without sound.
  }
}

export async function playSoundCue(kind: SoundCueKind) {
  if (!isSoundEnabled) return;

  const now = Date.now();
  if (now - lastPlayedAt[kind] < PLAY_DEBOUNCE_MS) return;
  lastPlayedAt[kind] = now;

  try {
    await ensureInitialized();
    const sound = loadedSounds[kind];
    if (!sound) return;
    await sound.replayAsync();
  } catch {
    // Ignore playback failures to avoid interrupting session transitions.
  }
}

export async function disposeSoundCues() {
  const sounds = Object.values(loadedSounds).filter((sound): sound is Audio.Sound => Boolean(sound));

  await Promise.all(
    sounds.map(async (sound) => {
      try {
        await sound.unloadAsync();
      } catch {
        // Ignore unload errors during teardown.
      }
    })
  );

  for (const key of Object.keys(loadedSounds) as SoundCueKind[]) {
    delete loadedSounds[key];
  }

  initialized = false;
  initPromise = null;
}
