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
    const particlesRef = useRef({ core: null, ring: null, wave: null });
    const originalRingPositions = useRef(null);
    const originalWavePositions = useRef(null);
    const requestRef = useRef();

    // Smoothing states
    const volumeRef = useRef(0);
    const smoothedPulse = useRef(0);
    const smoothedHighs = useRef(0);
    const smoothedMids = useRef(0);
    const wavePhase = useRef(0);

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

        // 1. Core Sphere (White/Inner)
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

        // 2. BLUE VOICE WAVE LAYER (Particulated Glow - Static Orientation)
        const waveCount = 8000; // Increased for richer particulated effect
        const waveGeometry = new THREE.BufferGeometry();
        const wavePos = new Float32Array(waveCount * 3);
        const waveOrgs = new Float32Array(waveCount * 3);
        for (let i = 0; i < waveCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 1.9 + (Math.random() - 0.5) * 0.4; // Distributed "fuzzy" radius
            wavePos[i * 3] = Math.cos(angle) * radius;
            wavePos[i * 3 + 1] = Math.sin(angle) * radius;
            wavePos[i * 3 + 2] = (Math.random() - 0.5) * 0.8; // Added some depth
            waveOrgs[i * 3] = wavePos[i * 3];
            waveOrgs[i * 3 + 1] = wavePos[i * 3 + 1];
            waveOrgs[i * 3 + 2] = wavePos[i * 3 + 2];
        }
        originalWavePositions.current = waveOrgs;
        waveGeometry.setAttribute('position', new THREE.BufferAttribute(wavePos, 3));
        const waveMaterial = new THREE.PointsMaterial({
            color: 0x3399ff,
            size: 0.02,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const waveParticles = new THREE.Points(waveGeometry, waveMaterial);
        scene.add(waveParticles);

        // 3. Outer Ring (Golden)
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

        particlesRef.current = { core: coreParticles, ring: ringParticles, wave: waveParticles };

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
            const listening = isListening;

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

            // 1. CORE ANIMATION - Constant slow rotation
            coreParticles.rotation.y += 0.003;
            coreParticles.rotation.x += 0.001;
            const coreScale = 1 + p * 0.4;
            coreParticles.scale.set(coreScale, coreScale, coreScale);
            coreMaterial.opacity = 0.4 + p * 0.4;
            coreMaterial.color.setHex(listening && p > 0.02 ? 0xccffff : 0xffffff);

            // 2. BLUE WAVE ANIMATION (Middle) - Particulated Glow, NON-SPINNING
            // We do NOT update waveParticles.rotation
            const wavePositions = waveParticles.geometry.attributes.position.array;
            const waveOrgs = originalWavePositions.current;

            if (listening && p > 0.01) {
                waveMaterial.opacity += (0.9 - waveMaterial.opacity) * 0.05;
                // Particulated spectral mapping
                for (let i = 0; i < waveCount; i++) {
                    const idx = i * 3;
                    // Fixed angle for each particle since it doesn't spin
                    const angle = Math.atan2(waveOrgs[idx + 1], waveOrgs[idx]);
                    const rBase = Math.sqrt(waveOrgs[idx] * waveOrgs[idx] + waveOrgs[idx + 1] * waveOrgs[idx + 1]);

                    const freqIdx = Math.floor((Math.abs(angle) / Math.PI) * (dataArrayRef.current?.length || 0) * 0.4);
                    const magnitude = (dataArrayRef.current ? dataArrayRef.current[freqIdx] : 0) / 255;

                    // Displacement + static shimmer
                    const displacement = magnitude * 1.8 * (1 + Math.sin(i * 0.1 + wavePhase.current) * 0.1);
                    wavePositions[idx] = Math.cos(angle) * (rBase + displacement);
                    wavePositions[idx + 1] = Math.sin(angle) * (rBase + displacement);
                    wavePositions[idx + 2] = waveOrgs[idx + 2] + Math.cos(i + wavePhase.current * 2) * magnitude * 1.5;
                }
                waveParticles.geometry.attributes.position.needsUpdate = true;

                // Pulsating glow color
                waveMaterial.color.setHSL(0.58 + Math.sin(wavePhase.current * 0.5) * 0.02, 0.9, 0.5 + m * 0.3);
                waveMaterial.size = 0.015 + magnitudeRef_dummy * 0.02; // We'll use p for general size
                waveMaterial.size = 0.015 + p * 0.03;
            } else {
                waveMaterial.opacity *= 0.85;
            }

            // 3. RING ANIMATION - Constant slow rotation
            ringParticles.rotation.z -= 0.002;
            const posAttr = ringParticles.geometry.attributes.position;
            const positions = posAttr.array;
            const originals = originalRingPositions.current;

            wavePhase.current += 0.02 + p * 0.05;

            for (let i = 0; i < ringCount; i++) {
                const idx = i * 3;
                const x = originals[idx];
                const y = originals[idx + 1];
                const z = originals[idx + 2];

                const angle = Math.atan2(y, x);
                const dist = Math.sqrt(x * x + y * y);

                const ripple = Math.sin(dist * 1.5 - wavePhase.current * 4) * p * 0.4;
                const wave = Math.cos(angle * 5 + wavePhase.current * 2) * hp * 0.2;
                const factor = 1 + ripple + wave;

                positions[idx] = x * factor;
                positions[idx + 1] = y * factor;
                positions[idx + 2] = z + Math.sin(angle * 4 + wavePhase.current * 3) * hp * 1.0;
            }
            posAttr.needsUpdate = true;

            if (listening && p > 0.01) {
                ringMaterial.color.setHSL(0.58 + m * 0.05, 0.9, 0.6);
                ringMaterial.opacity = 0.3 + hp * 0.7;
            } else {
                ringMaterial.color.setHex(0xffbb44);
                ringMaterial.opacity = 0.3;
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
    }, [isListening]);

    return (
        <div className="relative w-full h-screen bg-[#060606] overflow-hidden flex flex-col items-center justify-between text-white font-sans select-none">
            {/* Top Badge */}
            <div className="mt-8 z-10 flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full backdrop-blur-md">
                <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="w-5 h-5 rounded-full border border-black shadow-sm" style={{ background: `hsl(${i * 45}, 60%, 45%)` }} />
                    ))}
                </div>
                <span className="text-xs font-medium text-white/50 tracking-wider">6 SOURCES</span>
            </div>

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
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[160px] pointer-events-none transition-all duration-150 ease-out"
                style={{
                    width: `${400 + smoothedPulse.current * 1000}px`,
                    height: `${400 + smoothedPulse.current * 1000}px`,
                    backgroundColor: isListening && smoothedPulse.current > 0.05
                        ? `rgba(60, 140, 255, ${0.1 + smoothedPulse.current * 0.3})`
                        : `rgba(255, 160, 40, ${0.05 + smoothedPulse.current * 0.1})`
                }}
            />
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px] pointer-events-none transition-all duration-100 ease-out"
                style={{
                    width: `${200 + smoothedHighs.current * 600}px`,
                    height: `${200 + smoothedHighs.current * 600}px`,
                    backgroundColor: isListening && smoothedHighs.current > 0.05
                        ? `rgba(100, 200, 255, ${0.1 + smoothedHighs.current * 0.3})`
                        : `rgba(255, 255, 255, ${0.05 + smoothedHighs.current * 0.1})`
                }}
            />
        </div>
    );
};

export default App;
