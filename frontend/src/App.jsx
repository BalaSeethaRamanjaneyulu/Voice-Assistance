import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useAudioAnalysis } from './hooks/useAudioAnalysis';
import {
    PARTICLES_CONFIG,
    ANIMATION_CONFIG,
    GLOW_CONFIG,
    CAMERA_CONFIG
} from './config/visualizationConfig';
import {
    createSphereParticles,
    createRingParticles,
    createRadialGradient,
    updateGlowElement
} from './utils/visualizationHelpers';

const App = () => {
    // ========================================================================
    // STATE & REFS
    // ========================================================================

    const containerRef = useRef(null);
    const [isListening, setIsListening] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);
    const [statusText, setStatusText] = useState("Tap mic to start");

    // Audio hook
    const { startAudio, resumeAudio, getFrequencyData } = useAudioAnalysis();

    //Three.js refs
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

    const handleStartAudio = async () => {
        const success = await startAudio();
        if (success) {
            setIsListening(true);
            setHasPermission(true);
            setStatusText("Listening...");
        } else {
            setStatusText("Microphone access denied.");
        }
    };

    const toggleMic = async () => {
        if (!isListening) {
            if (!hasPermission) {
                await handleStartAudio();
            } else {
                await resumeAudio();
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
            CAMERA_CONFIG.FOV,
            window.innerWidth / window.innerHeight,
            CAMERA_CONFIG.NEAR,
            CAMERA_CONFIG.FAR
        );
        camera.position.z = CAMERA_CONFIG.POSITION_Z;

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
            const listening = isListening;
            const { low: lowFreq, mid: midFreq, high: highFreq } = listening
                ? getFrequencyData()
                : { low: 0, mid: 0, high: 0 };

            // Apply smoothing
            smoothedPulse.current += (lowFreq - smoothedPulse.current) * ANIMATION_CONFIG.SMOOTHING.PULSE;
            smoothedMids.current += (midFreq - smoothedMids.current) * ANIMATION_CONFIG.SMOOTHING.MIDS;
            smoothedHighs.current += (highFreq - smoothedHighs.current) * ANIMATION_CONFIG.SMOOTHING.HIGHS;

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
    }, [isListening, getFrequencyData]);

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
