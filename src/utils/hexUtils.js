/**
 * hexUtils.js
 * Utility functions for hex grid calculations
 */

/**
 * Calculate the distance between two hex coordinates
 * @param {Object} a - First hex {x, y} or {q, r}
 * @param {Object} b - Second hex {x, y} or {q, r}
 * @returns {number} Distance between hexes
 */
export function hexDistance(a, b) {
  // 支持x,y坐标
  const q1 = a.q !== undefined ? a.q : a.x;
  const r1 = a.r !== undefined ? a.r : a.y;
  const q2 = b.q !== undefined ? b.q : b.x;
  const r2 = b.r !== undefined ? b.r : b.y;
  
  // 计算s坐标（六边形坐标系中的第三个轴）
  const s1 = -q1 - r1;
  const s2 = -q2 - r2;
  
  // 使用三轴坐标计算距离
  return Math.max(
    Math.abs(q1 - q2),
    Math.abs(r1 - r2),
    Math.abs(s1 - s2)
  );
}

/**
 * Get all neighboring hex coordinates
 * @param {Object} hex - Center hex {q, r}
 * @returns {Array} Array of neighbor coordinates
 */
export function hexNeighbors(hex) {
  const directions = [
    {q: 1, r: 0}, {q: 1, r: -1}, {q: 0, r: -1},
    {q: -1, r: 0}, {q: -1, r: 1}, {q: 0, r: 1}
  ];
  
  return directions.map(dir => ({
    q: hex.q + dir.q,
    r: hex.r + dir.r
  }));
}

/**
 * Convert hex coordinates to pixel position
 * @param {Object} hex - Hex coordinates {q, r}
 * @param {number} size - Hex size
 * @returns {Object} Pixel coordinates {x, y}
 */
export function hexToPixel(hex, size) {
  // Flat-top orientation
  const x = size * (3/2) * hex.q;
  const y = size * Math.sqrt(3) * (hex.r + hex.q/2);
  
  return {x, y};
}

/**
 * Convert pixel coordinates to hex coordinates
 * @param {Object} pixel - Pixel coordinates {x, y}
 * @param {number} size - Hex size
 * @returns {Object} Hex coordinates {q, r}
 */
export function pixelToHex(pixel, size) {
  // Flat-top orientation
  const q = (2/3) * pixel.x / size;
  const r = (Math.sqrt(3)/3 * pixel.y - 1/3 * pixel.x) / size;
  
  return hexRound({q, r});
}

/**
 * Round fractional hex coordinates to nearest hex
 * @param {Object} hex - Hex coordinates {q, r} (fractional)
 * @returns {Object} Rounded hex coordinates {q, r}
 */
export function hexRound(hex) {
  let q = Math.round(hex.q);
  let r = Math.round(hex.r);
  const s = Math.round(-q - r);
  
  const q_diff = Math.abs(q - hex.q);
  const r_diff = Math.abs(r - hex.r);
  const s_diff = Math.abs(s - (-hex.q - hex.r));
  
  if (q_diff > r_diff && q_diff > s_diff) {
    q = -r - s;
  } else if (r_diff > s_diff) {
    r = -q - s;
  }
  
  return {q, r};
}

/**
 * Get all hexes in a specified range
 * @param {Object} center - Center hex {q, r}
 * @param {number} range - Range in hex distance
 * @returns {Array} Array of hex coordinates in range
 */
export function hexesInRange(center, range) {
  const results = [];
  
  for (let q = -range; q <= range; q++) {
    const r1 = Math.max(-range, -q - range);
    const r2 = Math.min(range, -q + range);
    
    for (let r = r1; r <= r2; r++) {
      results.push({q: center.q + q, r: center.r + r});
    }
  }
  
  return results;
}

/**
 * Check if two hexes are adjacent
 * @param {Object} a - First hex {q, r}
 * @param {Object} b - Second hex {q, r}
 * @returns {boolean} Whether hexes are adjacent
 */
export function areHexesAdjacent(a, b) {
  return hexDistance(a, b) === 1;
}

/**
 * Get all neighboring hex coordinates
 * @param {Object} center - Center hex {q, r}
 * @returns {Array} Array of neighbor coordinates
 */
export function getHexNeighbors(center) {
  const directions = [
    {q: 1, r: 0}, {q: 1, r: -1}, {q: 0, r: -1},
    {q: -1, r: 0}, {q: -1, r: 1}, {q: 0, r: 1}
  ];
  
  return directions.map(dir => ({
    q: center.q + dir.q,
    r: center.r + dir.r
  }));
}

/**
 * Get all hexes in a specified range
 * @param {Object} center - Center hex {q, r}
 * @param {number} range - Range in hex distance
 * @returns {Array} Array of hex coordinates in range
 */
export function getHexesInRange(center, range) {
  const results = [];
  
  for (let q = -range; q <= range; q++) {
    const r1 = Math.max(-range, -q - range);
    const r2 = Math.min(range, -q + range);
    
    for (let r = r1; r <= r2; r++) {
      results.push({q: center.q + q, r: center.r + r});
    }
  }
  
  return results;
}

/**
 * Get all hexes in a specified range
 * @param {Object} start - Start hex {q, r}
 * @param {Object} end - End hex {q, r}
 * @returns {Array} Array of hex coordinates in range
 */
export function getHexLinePath(start, end) {
  const N = hexDistance(start, end);
  const path = [];
  
  for (let i = 0; i <= N; i++) {
    const t = N === 0 ? 0.0 : i / N;
    path.push(hexLerp(start, end, t));
  }
  
  return path;
}

/**
 * Linearly interpolate between two hexes
 * @param {Object} a - Start hex {q, r}
 * @param {Object} b - End hex {q, r}
 * @param {number} t - Interpolation parameter [0,1]
 * @returns {Object} Interpolated hex {q, r}
 */
function hexLerp(a, b, t) {
  return {
    q: Math.round(a.q * (1 - t) + b.q * t),
    r: Math.round(a.r * (1 - t) + b.r * t)
  };
}