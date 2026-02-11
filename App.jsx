import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

// ============================================================================
// CONSTANTS
// ============================================================================

// Audio Analysis Configuration
const AUDIO_CONFIG = {
    FFT_SIZE: 1024,
    SMOOTHING: 0.6,
    FREQ_RANGES: {
        LOW: { start: 0, end: 15, bins: 15 },
        MID: { start: 15, end: 60, bins: 45 },
        HIGH: { start: 60, end: 150, bins: 90 }
    }
};

// Particle System Configuration
const PARTICLES_CONFIG = {
    CORE: {
        COUNT: 3000,
        RADIUS: 1.2,
        SIZE: 0.015,
        COLOR_IDLE: 0xffffff,
        COLOR_ACTIVE: 0x3399ff,
        OPACITY_IDLE: 0.4,
        OPACITY_BASE: 0.6,
        OPACITY_MULTIPLIER: 0.4
    },
    RING: {
        COUNT: 8000,
        RADIUS_MIN: 2.8,
        RADIUS_RANGE: 0.8,
        DEPTH: 0.6,
        SIZE: 0.02,
        COLOR_IDLE: 0xffbb44,
        COLOR_ACTIVE: 0x3399ff,
        OPACITY_IDLE: 0.3,
        OPACITY_BASE: 0.5,
        OPACITY_MULTIPLIER: 0.3,
        ROTATION_SPEED: -0.002
    }
};

// Animation Configuration
const ANIMATION_CONFIG = {
    CORE: {
        ROTATION_BASE: 0.003,
        ROTATION_MULTIPLIER: 0.05,
        ROTATION_X: 0.001,
        SCALE_MULTIPLIER: 0.6
    },
    SMOOTHING: {
        PULSE: 0.15,
        MIDS: 0.1,
        HIGHS: 0.1
    }
};

// Glow Configuration
const GLOW_CONFIG = {
    PRIMARY: {
        SIZE_BASE: 450,
        SIZE_MULTIPLIER: 1000,
        OPACITY_ACTIVE: { base: 0.06, multiplier: 0.24 },
        OPACITY_IDLE: { base: 0.045, multiplier: 0.09 },
        SCALE_MULTIPLIER: 0.15,
        BLUR: 200,
        COLOR_ACTIVE: 'rgba(60, 140, 255,',
        COLOR_IDLE: 'rgba(255, 160, 40,',
        GRADIENT_STOPS: [0, 0.6, 40, 0, 70]
    },
    SECONDARY: {
        SIZE_BASE: 280,
        SIZE_MULTIPLIER: 700,
        OPACITY_ACTIVE: { base: 0.065, multiplier: 0.315 },
        OPACITY_IDLE: { base: 0.075, multiplier: 0.13 },
        SCALE_MULTIPLIER: 0.2,
        BLUR: 140,
        COLOR_ACTIVE: 'rgba(100, 200, 255,',
        COLOR_IDLE: 'rgba(255, 255, 255,',
        GRADIENT_STOPS: [0, 0.5, 35, 0, 65]
    }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates spherical particle positions using Fibonacci sphere algorithm
 */
const createSphereParticles = (count, radius) => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const theta = Math.acos(1 - 2 * Math.random());
        const phi = 2 * Math.PI * Math.random();
        positions[i * 3] = radius * Math.sin(theta) * Math.cos(phi);
        positions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
        positions[i * 3 + 2] = radius * Math.cos(theta);
    }
    return positions;
};

/**
 * Creates ring-shaped particle positions
 */
const createRingParticles = (count, radiusMin, radiusRange, depth) => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = radiusMin + Math.random() * radiusRange;
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = Math.sin(angle) * radius;
        positions[i * 3 + 2] = (Math.random() - 0.5) * depth;
    }
    return positions;
};

/**
 * Generates radial gradient CSS string
 */
const createRadialGradient = (color, opacity, midOpacity, midStop, endStop) => {
    return `radial-gradient(circle, ${color} ${opacity}) 0%, ${color} ${midOpacity}) ${midStop}%, ${color} 0) ${endStop}%)`;
};

/**
 * Updates glow element styles for performance
 */
const updateGlowElement = (element, size, background, scale) => {
    if (!element) return;
    element.style.width = `${size}px`;
    element.style.height = `${size}px`;
    element.style.background = background;
    element.style.transform = `translate(-50%, -50%) scale(${scale})`;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const App = () => {
    // ========================================================================
    // STATE & REFS
    // ========================================================================

    const containerRef = useRef(null);
    const [isListening, setIsListening] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);
    const [statusText, setStatusText] = useState("Tap mic to start");

    // Audio refs
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const dataArrayRef = useRef(null);
    const sourceRef = useRef(null);

    // Three.js refs
    const rendererRef = useRef(null);
    const requestRef = useRef();

    // Audio smoothing refs
    const smoothedPulse = useRef(0);
    const smoothedHighs = useRef(0);
    const smoothedMids = useRef(0);

    // Glow element refs
    const glowPrimaryRef = useRef(null);
    const glowSecondaryRef = useRef(null);

    // ========================================================================
    // AUDIO HANDLING
    // ========================================================================

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
            setIsListening(true);
            setHasPermission(true);
            setStatusText("Listening...");
        } catch (err) {
            console.error("Error accessing microphone:", err);
            setStatusText("Microphone access denied.");
        }
    };

    const toggleMic = async () => {
        if (!isListening) {
            if (!hasPermission) {
                await startAudio();
            } else {
                if (audioContextRef.current?.state === 'suspended') {
                    await audioContextRef.current.resume();
                }
                setIsListening(true);
                setStatusText("Listening...");
            }
        } else {
            setIsListening(false);
            setStatusText("Paused");
        }
    };

    // ========================================================================
    // THREE.JS VISUALIZATION
    // ========================================================================

    useEffect(() => {
        if (!containerRef.current) return;

        // Initialize Three.js scene
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            70,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.z = 6;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Create core particle sphere
        const coreGeometry = new THREE.BufferGeometry();
        const corePositions = createSphereParticles(
            PARTICLES_CONFIG.CORE.COUNT,
            PARTICLES_CONFIG.CORE.RADIUS
        );
        coreGeometry.setAttribute('position', new THREE.BufferAttribute(corePositions, 3));

        const coreMaterial = new THREE.PointsMaterial({
            color: PARTICLES_CONFIG.CORE.COLOR_IDLE,
            size: PARTICLES_CONFIG.CORE.SIZE,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending
        });
        const coreParticles = new THREE.Points(coreGeometry, coreMaterial);
        scene.add(coreParticles);

        // Create outer ring particles
        const ringGeometry = new THREE.BufferGeometry();
        const ringPositions = createRingParticles(
            PARTICLES_CONFIG.RING.COUNT,
            PARTICLES_CONFIG.RING.RADIUS_MIN,
            PARTICLES_CONFIG.RING.RADIUS_RANGE,
            PARTICLES_CONFIG.RING.DEPTH
        );
        ringGeometry.setAttribute('position', new THREE.BufferAttribute(ringPositions, 3));

        const ringMaterial = new THREE.PointsMaterial({
            color: PARTICLES_CONFIG.RING.COLOR_IDLE,
            size: PARTICLES_CONFIG.RING.SIZE,
            transparent: true,
            opacity: PARTICLES_CONFIG.RING.OPACITY_IDLE,
            blending: THREE.AdditiveBlending
        });
        const ringParticles = new THREE.Points(ringGeometry, ringMaterial);
        scene.add(ringParticles);

        // Handle window resize
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        // Animation loop
        const animate = () => {
            requestRef.current = requestAnimationFrame(animate);

            // Analyze audio frequencies
            let lowFreq = 0, midFreq = 0, highFreq = 0;
            const listening = isListening;

            if (listening && analyserRef.current && dataArrayRef.current) {
                analyserRef.current.getByteFrequencyData(dataArrayRef.current);

                const { LOW, MID, HIGH } = AUDIO_CONFIG.FREQ_RANGES;
                for (let i = LOW.start; i < LOW.end; i++) lowFreq += dataArrayRef.current[i];
                for (let i = MID.start; i < MID.end; i++) midFreq += dataArrayRef.current[i];
                for (let i = HIGH.start; i < HIGH.end; i++) highFreq += dataArrayRef.current[i];

                lowFreq /= LOW.bins;
                midFreq /= MID.bins;
                highFreq /= HIGH.bins;
            }

            // Apply smoothing
            smoothedPulse.current += (lowFreq / 255 - smoothedPulse.current) * ANIMATION_CONFIG.SMOOTHING.PULSE;
            smoothedMids.current += (midFreq / 255 - smoothedMids.current) * ANIMATION_CONFIG.SMOOTHING.MIDS;
            smoothedHighs.current += (highFreq / 255 - smoothedHighs.current) * ANIMATION_CONFIG.SMOOTHING.HIGHS;

            const p = smoothedPulse.current;
            const m = smoothedMids.current;
            const hp = smoothedHighs.current;

            // Animate core particles
            coreParticles.rotation.y += ANIMATION_CONFIG.CORE.ROTATION_BASE + p * ANIMATION_CONFIG.CORE.ROTATION_MULTIPLIER;
            coreParticles.rotation.x += ANIMATION_CONFIG.CORE.ROTATION_X;
            const coreScale = 1 + p * ANIMATION_CONFIG.CORE.SCALE_MULTIPLIER;
            coreParticles.scale.set(coreScale, coreScale, coreScale);

            if (listening) {
                coreMaterial.color.setHSL(0.55 + m * 0.1, 0.8, 0.5 + hp * 0.2);
                coreMaterial.opacity = PARTICLES_CONFIG.CORE.OPACITY_BASE + p * PARTICLES_CONFIG.CORE.OPACITY_MULTIPLIER;
            } else {
                coreMaterial.color.setHex(PARTICLES_CONFIG.CORE.COLOR_IDLE);
                coreMaterial.opacity = PARTICLES_CONFIG.CORE.OPACITY_IDLE;
            }

            // Animate ring particles
            ringParticles.rotation.z += PARTICLES_CONFIG.RING.ROTATION_SPEED;

            if (listening) {
                ringMaterial.color.setHex(PARTICLES_CONFIG.RING.COLOR_ACTIVE);
                ringMaterial.opacity = PARTICLES_CONFIG.RING.OPACITY_BASE + p * PARTICLES_CONFIG.RING.OPACITY_MULTIPLIER;
            } else {
                ringMaterial.color.setHex(PARTICLES_CONFIG.RING.COLOR_IDLE);
                ringMaterial.opacity = PARTICLES_CONFIG.RING.OPACITY_IDLE;
            }

            // Update background glows
            if (glowPrimaryRef.current) {
                const config = GLOW_CONFIG.PRIMARY;
                const size = config.SIZE_BASE + p * config.SIZE_MULTIPLIER;
                const opacityConfig = listening ? config.OPACITY_ACTIVE : config.OPACITY_IDLE;
                const opacity = opacityConfig.base + p * opacityConfig.multiplier;
                const scale = 1 + p * config.SCALE_MULTIPLIER;
                const color = listening ? config.COLOR_ACTIVE : config.COLOR_IDLE;
                const [stop1, midMult, midStop, endMult, endStop] = config.GRADIENT_STOPS;

                const gradient = createRadialGradient(
                    color,
                    opacity,
                    opacity * midMult,
                    midStop,
                    endStop
                );

                updateGlowElement(glowPrimaryRef.current, size, gradient, scale);
            }

            if (glowSecondaryRef.current) {
                const config = GLOW_CONFIG.SECONDARY;
                const size = config.SIZE_BASE + hp * config.SIZE_MULTIPLIER;
                const opacityConfig = listening ? config.OPACITY_ACTIVE : config.OPACITY_IDLE;
                const opacity = opacityConfig.base + hp * opacityConfig.multiplier;
                const scale = 1 + hp * config.SCALE_MULTIPLIER;
                const color = listening ? config.COLOR_ACTIVE : config.COLOR_IDLE;
                const [stop1, midMult, midStop, endMult, endStop] = config.GRADIENT_STOPS;

                const gradient = createRadialGradient(
                    color,
                    opacity,
                    opacity * midMult,
                    midStop,
                    endStop
                );

                updateGlowElement(glowSecondaryRef.current, size, gradient, scale);
            }

            renderer.render(scene, camera);
        };

        animate();

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(requestRef.current);
            if (rendererRef.current) {
                rendererRef.current.dispose();
                containerRef.current?.removeChild(renderer.domElement);
            }
        };
    }, [isListening]);

    // ========================================================================
    // RENDER
    // ========================================================================

    return (
        <div className="relative w-full h-screen bg-[#060606] overflow-hidden flex flex-col items-center justify-between text-white font-sans select-none">
            {/* Three.js Canvas Container / Click Surface */}
            <div ref={containerRef} className="absolute inset-0 cursor-pointer" onClick={toggleMic} />

            {/* Status Text */}
            <div className="absolute top-8 left-8 z-10 pointer-events-none">
                <h2 className={`text-2xl font-light tracking-[0.1em] uppercase transition-all duration-700 ${isListening ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-2'
                    }`}>
                    {statusText}
                </h2>
            </div>

            {/* Background Glow Effects */}
            <div
                ref={glowPrimaryRef}
                className="absolute top-1/2 left-1/2 rounded-full blur-[200px] pointer-events-none"
                style={{
                    width: '500px',
                    height: '500px',
                    backgroundColor: 'rgba(255, 160, 40, 0.08)',
                    transform: 'translate(-50%, -50%)'
                }}
            />
            <div
                ref={glowSecondaryRef}
                className="absolute top-1/2 left-1/2 rounded-full blur-[140px] pointer-events-none"
                style={{
                    width: '300px',
                    height: '300px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transform: 'translate(-50%, -50%)'
                }}
            />
        </div>
    );
};

export default App;
