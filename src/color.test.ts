import { describe, expect, it } from 'vitest';
import { contrast, hexToRgb, rgbToHex, separation, simulate } from './color';
describe('colour utilities', () => {
  it('parses and formats a hex swatch', () => expect(rgbToHex(hexToRgb('#1aB2c3')!)).toBe('#1AB2C3'));
  it('rejects partial hex values', () => expect(hexToRgb('#fff')).toBeNull());
  it('keeps normal vision unchanged', () => expect(simulate([12, 80, 240], 'normal')).toEqual([12, 80, 240]));
  it('finds black and white high contrast', () => expect(contrast([0, 0, 0], [255, 255, 255])).toBeCloseTo(21, 0));
  it('has zero separation for the same colour', () => expect(separation([20, 30, 40], [20, 30, 40])).toBe(0));
});
