import { useRef } from 'react';
import { AUDIO_CONFIG } from '../config/visualizationConfig';

/**
 * Custom hook for managing audio input and analysis
 * Handles microphone access, audio context, and frequency analysis
 */
export const useAudioAnalysis = () => {
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const dataArrayRef = useRef(null);
    const sourceRef = useRef(null);

    /**
     * Initializes audio context and starts capturing microphone input
     * @returns {Promise<boolean>} Success status
     */
    const startAudio = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContextRef.current = new AudioContext();
            analyserRef.current = audioContextRef.current.createAnalyser();
            sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);

            analyserRef.current.fftSize = AUDIO_CONFIG.FFT_SIZE;
            analyserRef.current.smoothingTimeConstant = AUDIO_CONFIG.SMOOTHING;
            const bufferLength = analyserRef.current.frequencyBinCount;
            dataArrayRef.current = new Uint8Array(bufferLength);

            sourceRef.current.connect(analyserRef.current);
            return true;
        } catch (err) {
            console.error("Error accessing microphone:", err);
            return false;
        }
    };

    /**
     * Resumes audio context if suspended
     */
    const resumeAudio = async () => {
        if (audioContextRef.current?.state === 'suspended') {
            await audioContextRef.current.resume();
        }
    };

    /**
     * Gets frequency data from the analyser
     * @returns {Object} Frequency data {low, mid, high}
     */
    const getFrequencyData = () => {
        if (!analyserRef.current || !dataArrayRef.current) {
            return { low: 0, mid: 0, high: 0 };
        }

        analyserRef.current.getByteFrequencyData(dataArrayRef.current);

        const { LOW, MID, HIGH } = AUDIO_CONFIG.FREQ_RANGES;
        let lowFreq = 0, midFreq = 0, highFreq = 0;

        for (let i = LOW.start; i < LOW.end; i++) lowFreq += dataArrayRef.current[i];
        for (let i = MID.start; i < MID.end; i++) midFreq += dataArrayRef.current[i];
        for (let i = HIGH.start; i < HIGH.end; i++) highFreq += dataArrayRef.current[i];

        return {
            low: lowFreq / LOW.bins / 255,
            mid: midFreq / MID.bins / 255,
            high: highFreq / HIGH.bins / 255
        };
    };

    return {
        audioContextRef,
        analyserRef,
        dataArrayRef,
        startAudio,
        resumeAudio,
        getFrequencyData
    };
};
