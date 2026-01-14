import { useEffect, useRef, useState } from 'react';
import { playSound, startAmbient, stopAmbient, stopSound, playSoundForDuration, getIsMuted, toggleMute as toggleMuteUtil, SoundKey } from '@/utils/audio';
import { useCharacter } from '@/contexts/CharacterContext';

/**
 * Hook to manage audio settings (mute/unmute)
 */
export const useAudioSettings = () => {
    const [isMuted, setIsMuted] = useState(getIsMuted());

    const toggleMute = () => {
        const newState = toggleMuteUtil();
        setIsMuted(newState);
        return newState;
    };

    return { isMuted, toggleMute };
};

/**
 * Hook to manage Eclipse state ambient sound (heartbeat)
 */
export const useEclipseAmbient = () => {
    const { character } = useCharacter();
    const isPlayingRef = useRef(false);

    useEffect(() => {
        const isEclipse = character.orbit >= 10;

        if (isEclipse && !isPlayingRef.current) {
            startAmbient('heartbeat', 0.4);
            isPlayingRef.current = true;
        } else if (!isEclipse && isPlayingRef.current) {
            stopAmbient();
            isPlayingRef.current = false;
        }

        // Cleanup on unmount
        return () => {
            if (isPlayingRef.current) {
                stopAmbient();
            }
        };
    }, [character.orbit]);
};

/**
 * Hook to track and play sounds when character stats change
 */
export const useCharacterSounds = () => {
    const { character } = useCharacter();
    const prevHpRef = useRef(character.currentHp);
    const prevOrbitRef = useRef(character.orbit);

    useEffect(() => {
        // HP Change sounds
        if (character.currentHp < prevHpRef.current) {
            playSoundForDuration('damage', 1500, 0.8);
        } else if (character.currentHp > prevHpRef.current && prevHpRef.current > 0) {
            playSoundForDuration('heal', 1500, 0.6);
        }
        prevHpRef.current = character.currentHp;
    }, [character.currentHp]);

    useEffect(() => {
        // Orbit Change sounds
        if (character.orbit > prevOrbitRef.current) {
            playSoundForDuration('orbitIncrease', 2500, 0.8);
        } else if (character.orbit < prevOrbitRef.current) {
            playSoundForDuration('orbitDecrease', 2500, 0.6);
        }
        prevOrbitRef.current = character.orbit;
    }, [character.orbit]);
};

/**
 * Simple hook to play a sound imperatively
 */
export const useSoundEffect = () => {
    return {
        play: (key: SoundKey, volume?: number) => playSound(key, volume),
        playForDuration: (key: SoundKey, duration: number, volume?: number) => playSoundForDuration(key, duration, volume),
        startLoop: (key: SoundKey, volume?: number) => startAmbient(key, volume),
        stopLoop: () => stopAmbient(),
        stop: (key: SoundKey) => stopSound(key)
    };
};

export { playSound, startAmbient, stopAmbient, stopSound, playSoundForDuration };
