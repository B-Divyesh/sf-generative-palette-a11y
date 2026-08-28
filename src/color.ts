export type RGB = [number, number, number];
export type Vision = 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia';

const matrices: Record<Vision, number[][]> = {
  normal: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
  protanopia: [[0.567, 0.433, 0], [0.558, 0.442, 0], [0, 0.242, 0.758]],
  deuteranopia: [[0.625, 0.375, 0], [0.7, 0.3, 0], [0, 0.3, 0.7]],
  tritanopia: [[0.95, 0.05, 0], [0, 0.433, 0.567], [0, 0.475, 0.525]]
};

export function hexToRgb(hex: string): RGB | null {
  const clean = hex.trim().replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  return [parseInt(clean.slice(0, 2), 16), parseInt(clean.slice(2, 4), 16), parseInt(clean.slice(4, 6), 16)];
}
export function rgbToHex([r, g, b]: RGB) { return '#' + [r, g, b].map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('').toUpperCase(); }
export function simulate(rgb: RGB, vision: Vision): RGB { const m = matrices[vision]; return m.map(row => row.reduce((sum, n, i) => sum + n * rgb[i], 0)) as RGB; }
export function separation(a: RGB, b: RGB) { return Math.sqrt(a.reduce((sum, n, i) => sum + (n - b[i]) ** 2, 0)); }
const linear = (c: number) => { c /= 255; return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; };
export function luminance([r, g, b]: RGB) { return .2126 * linear(r) + .7152 * linear(g) + .0722 * linear(b); }
export function contrast(a: RGB, b: RGB) { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x + .05) / (y + .05); }
export function mix(rgb: RGB, amount: number): RGB { return rgb.map(c => amount > 0 ? c + (255 - c) * amount : c * (1 + amount)) as RGB; }
export function nearest(rgb: RGB, palette: RGB[]) { return palette.reduce((best, p, i) => separation(rgb, p) < best.distance ? { index: i, distance: separation(rgb, p) } : best, { index: 0, distance: Infinity }); }
