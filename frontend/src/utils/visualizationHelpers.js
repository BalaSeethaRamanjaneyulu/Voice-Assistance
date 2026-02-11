/**
 * Creates spherical particle positions using Fibonacci sphere algorithm
 * @param {number} count - Number of particles to create
 * @param {number} radius - Radius of the sphere
 * @returns {Float32Array} Array of particle positions [x, y, z, x, y, z, ...]
 */
export const createSphereParticles = (count, radius) => {
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
 * @param {number} count - Number of particles to create
 * @param {number} radiusMin - Minimum radius of the ring
 * @param {number} radiusRange - Range to add to minimum radius
 * @param {number} depth - Depth of the ring (z-axis variation)
 * @returns {Float32Array} Array of particle positions [x, y, z, x, y, z, ...]
 */
export const createRingParticles = (count, radiusMin, radiusRange, depth) => {
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
 * @param {string} color - RGBA color string (partial, without opacity)
 * @param {number} opacity - Center opacity
 * @param {number} midOpacity - Mid-point opacity
 * @param {number} midStop - Mid-point stop percentage
 * @param {number} endStop - End stop percentage
 * @returns {string} CSS radial-gradient string
 */
export const createRadialGradient = (color, opacity, midOpacity, midStop, endStop) => {
    return `radial-gradient(circle, ${color} ${opacity}) 0%, ${color} ${midOpacity}) ${midStop}%, ${color} 0) ${endStop}%)`;
};

/**
 * Updates glow element styles for performance
 * @param {HTMLElement} element - DOM element to update
 * @param {number} size - Size in pixels
 * @param {string} background - Background CSS string
 * @param {number} scale - Scale multiplier
 */
export const updateGlowElement = (element, size, background, scale) => {
    if (!element) return;
    element.style.width = `${size}px`;
    element.style.height = `${size}px`;
    element.style.background = background;
    element.style.transform = `translate(-50%, -50%) scale(${scale})`;
};
