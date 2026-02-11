import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

const App = () => {
    const containerRef = useRef(null);
    const [isListening, setIsListening] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);
    const [statusText, setStatusText] = useState("Tap mic to start");

    // Audio Analysis Refs
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const dataArrayRef = useRef(null);
    const sourceRef = useRef(null);

    // Three.js Refs
    const rendererRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const particlesRef = useRef({ core: null, ring: null });
    const originalRingPositions = useRef(null);
    const requestRef = useRef();

    // Smoothing states
    const volumeRef = useRef(0);
    const smoothedPulse = useRef(0);
    const smoothedHighs = useRef(0);
    const smoothedMids = useRef(0);
    const wavePhase = useRef(0);

    // Glow element refs
    const glowPrimaryRef = useRef(null);
    const glowSecondaryRef = useRef(null);

    const startAudio = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContextRef.current = new AudioContext();
            analyserRef.current = audioContextRef.current.createAnalyser();
            sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);

            analyserRef.current.fftSize = 1024;
            analyserRef.current.smoothingTimeConstant = 0.6;
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

    useEffect(() => {
        if (!containerRef.current) return;

        // --- Initialization ---
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 6;
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // 1. Core Sphere
        const coreGeometry = new THREE.BufferGeometry();
        const coreCount = 3000;
        const corePos = new Float32Array(coreCount * 3);
        for (let i = 0; i < coreCount; i++) {
            const r = 1.2;
            const theta = Math.acos(1 - 2 * Math.random());
            const phi = 2 * Math.PI * Math.random();
            corePos[i * 3] = r * Math.sin(theta) * Math.cos(phi);
            corePos[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
            corePos[i * 3 + 2] = r * Math.cos(theta);
        }
        coreGeometry.setAttribute('position', new THREE.BufferAttribute(corePos, 3));
        const coreMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.015,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending
        });
        const coreParticles = new THREE.Points(coreGeometry, coreMaterial);
        scene.add(coreParticles);

        // 2. Outer Ring
        const ringGeometry = new THREE.BufferGeometry();
        const ringCount = 8000;
        const ringPos = new Float32Array(ringCount * 3);
        const ringOriginals = new Float32Array(ringCount * 3);
        for (let i = 0; i < ringCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 2.8 + Math.random() * 0.8;
            ringPos[i * 3] = Math.cos(angle) * radius;
            ringPos[i * 3 + 1] = Math.sin(angle) * radius;
            ringPos[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
            ringOriginals[i * 3] = ringPos[i * 3];
            ringOriginals[i * 3 + 1] = ringPos[i * 3 + 1];
            ringOriginals[i * 3 + 2] = ringPos[i * 3 + 2];
        }
        originalRingPositions.current = ringOriginals;
        ringGeometry.setAttribute('position', new THREE.BufferAttribute(ringPos, 3));
        const ringMaterial = new THREE.PointsMaterial({
            color: 0xffbb44,
            size: 0.02,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending
        });
        const ringParticles = new THREE.Points(ringGeometry, ringMaterial);
        scene.add(ringParticles);

        particlesRef.current = { core: coreParticles, ring: ringParticles };

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        // --- Animation Loop ---
        const animate = () => {
            requestRef.current = requestAnimationFrame(animate);

            let lowFreq = 0, midFreq = 0, highFreq = 0;
            const listening = isListening; // Capture current state

            if (listening && analyserRef.current && dataArrayRef.current) {
                analyserRef.current.getByteFrequencyData(dataArrayRef.current);
                for (let i = 0; i < 15; i++) lowFreq += dataArrayRef.current[i];
                for (let i = 15; i < 60; i++) midFreq += dataArrayRef.current[i];
                for (let i = 60; i < 150; i++) highFreq += dataArrayRef.current[i];
                lowFreq /= 15; midFreq /= 45; highFreq /= 90;
            }

            // Smoothing
            smoothedPulse.current += (lowFreq / 255 - smoothedPulse.current) * 0.15;
            smoothedMids.current += (midFreq / 255 - smoothedMids.current) * 0.1;
            smoothedHighs.current += (highFreq / 255 - smoothedHighs.current) * 0.1;

            const p = smoothedPulse.current;
            const m = smoothedMids.current;
            const hp = smoothedHighs.current;

            // 1. CORE ANIMATION
            coreParticles.rotation.y += 0.003 + p * 0.05;
            coreParticles.rotation.x += 0.001;
            const coreScale = 1 + p * 0.6;
            coreParticles.scale.set(coreScale, coreScale, coreScale);

            // Color switching
            if (listening) {
                // Variations of blue based on audio
                coreMaterial.color.setHSL(0.55 + m * 0.1, 0.8, 0.5 + hp * 0.2);
                coreMaterial.opacity = 0.6 + p * 0.4;
            } else {
                coreMaterial.color.setHex(0xffffff);
                coreMaterial.opacity = 0.4;
            }

            // 2. RING ANIMATION - Constant slow rotation, no voice reactivity
            ringParticles.rotation.z -= 0.002;

            // Ring color switching
            if (listening) {
                ringMaterial.color.setHex(0x3399ff);
                ringMaterial.opacity = 0.5 + p * 0.3;
            } else {
                ringMaterial.color.setHex(0xffbb44);
                ringMaterial.opacity = 0.3;
            }

            // 3. UPDATE BACKGROUND GLOWS DIRECTLY
            if (glowPrimaryRef.current) {
                const size = 500 + smoothedPulse.current * 1500;
                const opacity = listening
                    ? 0.2 + smoothedPulse.current * 0.65
                    : 0.08 + smoothedPulse.current * 0.15;
                const scale = 1 + smoothedPulse.current * 0.25;

                glowPrimaryRef.current.style.width = `${size}px`;
                glowPrimaryRef.current.style.height = `${size}px`;
                glowPrimaryRef.current.style.backgroundColor = listening
                    ? `rgba(60, 140, 255, ${opacity})`
                    : `rgba(255, 160, 40, ${opacity})`;
                glowPrimaryRef.current.style.transform = `translate(-50%, -50%) scale(${scale})`;
            }

            if (glowSecondaryRef.current) {
                const size = 300 + smoothedHighs.current * 1000;
                const opacity = listening
                    ? 0.25 + smoothedHighs.current * 0.7
                    : 0.1 + smoothedHighs.current * 0.2;
                const scale = 1 + smoothedHighs.current * 0.35;

                glowSecondaryRef.current.style.width = `${size}px`;
                glowSecondaryRef.current.style.height = `${size}px`;
                glowSecondaryRef.current.style.backgroundColor = listening
                    ? `rgba(100, 200, 255, ${opacity})`
                    : `rgba(255, 255, 255, ${opacity})`;
                glowSecondaryRef.current.style.transform = `translate(-50%, -50%) scale(${scale})`;
            }

            renderer.render(scene, camera);
        };

        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(requestRef.current);
            if (rendererRef.current) {
                rendererRef.current.dispose();
                containerRef.current?.removeChild(renderer.domElement);
            }
        };
    }, [isListening]); // It still needs isListening to update the closure in animate? 
    // Actually, capture isListening at start of animate.

    return (
        <div className="relative w-full h-screen bg-[#060606] overflow-hidden flex flex-col items-center justify-between text-white font-sans select-none">


            {/* Click Surface */}
            <div ref={containerRef} className="absolute inset-0 cursor-pointer" onClick={toggleMic} />

            {/* UI */}
            <div className="mb-16 z-10 flex flex-col items-center gap-10 w-full max-w-md px-6 pointer-events-none">
                <h2 className={`text-2xl font-light tracking-[0.1em] uppercase transition-all duration-700 ${isListening ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-2'}`}>
                    {statusText}
                </h2>
            </div>

            {/* BACKGROUND GLOWS */}
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
