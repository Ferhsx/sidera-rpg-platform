// Audio Manager for SIDERA - Diegetic Sound System
// Sound files located in /public/sounds/

// Sound file paths mapped to actual files
const SOUND_PATHS = {
    // Orbit / Corruption sounds
    orbitIncrease: '/sounds/519121__koen__drone2.wav',                    // Low drone
    orbitDecrease: '/sounds/543669__14jburchfield__breathe.mp3',          // Relief breath

    // Dice sounds
    diceRoll: '/sounds/594038__timon_heckroodt__wooden-dice-rolled-in-a-hand-recorded-with-a-zoom-h6-recorder-in-a-normal-room.wav',
    diceResult: '/sounds/587252__beetlemuse__dats-right.wav',             // Result reveal

    // Combat / Damage sounds
    damage: '/sounds/726619__riley_garinger__fightpunch_vi-punch-full-impact_01.wav',
    heal: '/sounds/543669__14jburchfield__breathe.mp3',                   // Soft breath
    death: '/sounds/519121__koen__drone2.wav',                            // Ominous drone

    // Atmosphere
    heartbeat: '/sounds/218454__timbre__remix-2-of-excerpt-of-218383__kferentchak__heartbeat.flac',
    whisper: '/sounds/271245__bertiehs__gasp-male.wav',                   // Gasp/whisper

    // UI feedback
    click: '/sounds/538448__andersmmg__soft-clicks.wav',
    success: '/sounds/587252__beetlemuse__dats-right.wav',                // Positive
    failure: '/sounds/514159__edwardszakal__distorted-beep-incorrect.mp3', // Negative
};

// Audio cache to avoid recreating Audio objects
const audioCache: Map<string, HTMLAudioElement> = new Map();

// Volume settings
let masterVolume = 0.5;
let sfxVolume = 0.7;
let ambientVolume = 0.3;

// Currently playing ambient sounds
let ambientAudio: HTMLAudioElement | null = null;
let isMuted = false;

/**
 * Get or create an Audio element for a sound
 */
const getAudio = (path: string): HTMLAudioElement | null => {
    try {
        if (audioCache.has(path)) {
            return audioCache.get(path)!;
        }

        const audio = new Audio(path);
        audio.volume = masterVolume * sfxVolume;
        audioCache.set(path, audio);
        return audio;
    } catch (e) {
        return null;
    }
};

/**
 * Play a one-shot sound effect
 */
export const playSound = (soundKey: keyof typeof SOUND_PATHS, volume?: number) => {
    if (isMuted) return null;

    const path = SOUND_PATHS[soundKey];
    const audio = getAudio(path);

    if (!audio) return null;

    // Boost clicks specifically as they might be too soft
    const volumeMultiplier = soundKey === 'click' ? 2 : 1;
    audio.volume = (volume ?? 1) * masterVolume * sfxVolume * volumeMultiplier;
    audio.currentTime = 0;
    audio.play().catch(() => {
        // Silently fail if audio can't play (e.g., no user interaction yet)
    });

    // Auto-stop clicks after a very short time
    if (soundKey === 'click') {
        setTimeout(() => {
            audio.pause();
            audio.currentTime = 0;
        }, 500); // Click duration: 500ms
    }

    return audio;
};

/**
 * Stop a specific sound effect
 */
export const stopSound = (soundKey: keyof typeof SOUND_PATHS) => {
    const path = SOUND_PATHS[soundKey];
    const audio = audioCache.get(path);
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
    }
};

/**
 * Play a sound for a specific duration then stop it
 */
export const playSoundForDuration = (soundKey: keyof typeof SOUND_PATHS, durationMs: number, volume?: number) => {
    playSound(soundKey, volume);
    setTimeout(() => {
        stopSound(soundKey);
    }, durationMs);
};

/**
 * Start an ambient loop (like heartbeat for Eclipse)
 */
export const startAmbient = (soundKey: keyof typeof SOUND_PATHS, volume?: number) => {
    stopAmbient(); // Stop any existing ambient

    if (isMuted) return;

    const path = SOUND_PATHS[soundKey];

    try {
        ambientAudio = new Audio(path);
        ambientAudio.loop = true;
        ambientAudio.volume = (volume ?? 1) * masterVolume * ambientVolume;
        ambientAudio.play().catch(() => { });
    } catch (e) {
    }
};

/**
 * Stop the ambient loop
 */
export const stopAmbient = () => {
    if (ambientAudio) {
        ambientAudio.pause();
        ambientAudio.currentTime = 0;
        ambientAudio = null;
    }
};

/**
 * Set master volume (0 to 1)
 */
export const setMasterVolume = (volume: number) => {
    masterVolume = Math.max(0, Math.min(1, volume));

    // Update ambient if playing
    if (ambientAudio) {
        ambientAudio.volume = masterVolume * ambientVolume;
    }
};

/**
 * Get current muted state
 */
export const getIsMuted = () => isMuted;

/**
 * Mute/unmute all audio
 */
export const toggleMute = () => {
    isMuted = !isMuted;

    if (isMuted) {
        stopAmbient();
        // Pause all cached sounds
        audioCache.forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
    }

    return isMuted;
};

/**
 * Check if sounds are available (files exist)
 */
export const checkSoundsAvailable = async (): Promise<boolean> => {
    try {
        const response = await fetch(SOUND_PATHS.click, { method: 'HEAD' });
        return response.ok;
    } catch {
        return false;
    }
};

// Export sound keys for type safety
export type SoundKey = keyof typeof SOUND_PATHS;
export { SOUND_PATHS };
