// ============================================================================
// AUDIO ANALYSIS CONFIGURATION
// ============================================================================

export const AUDIO_CONFIG = {
    FFT_SIZE: 1024,
    SMOOTHING: 0.6,
    FREQ_RANGES: {
        LOW: { start: 0, end: 15, bins: 15 },
        MID: { start: 15, end: 60, bins: 45 },
        HIGH: { start: 60, end: 150, bins: 90 }
    }
};

// ============================================================================
// PARTICLE SYSTEM CONFIGURATION
// ============================================================================

export const PARTICLES_CONFIG = {
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

// ============================================================================
// ANIMATION CONFIGURATION
// ============================================================================

export const ANIMATION_CONFIG = {
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

// ============================================================================
// GLOW CONFIGURATION
// ============================================================================

export const GLOW_CONFIG = {
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
// CAMERA CONFIGURATION
// ============================================================================

export const CAMERA_CONFIG = {
    FOV: 70,
    NEAR: 0.1,
    FAR: 1000,
    POSITION_Z: 6
};
