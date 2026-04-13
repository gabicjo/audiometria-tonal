import { computeAdaptiveStep } from '../../js/logic/volumeAdjustment.js';

describe('computeAdaptiveStep', () => {
  test('should return 1 if difference is 0', () => {
    expect(computeAdaptiveStep(50, 50)).toBe(1);
  });

  test('should return 1 if difference is 1', () => {
    expect(computeAdaptiveStep(50, 51)).toBe(1);
  });

  test('should return half the difference for even differences > 1', () => {
    expect(computeAdaptiveStep(50, 60)).toBe(5);
  });

  test('should return floor of half the difference for odd differences > 1', () => {
    expect(computeAdaptiveStep(50, 61)).toBe(5);
  });

  test('should handle negative differences correctly', () => {
    expect(computeAdaptiveStep(60, 50)).toBe(5);
  });

  test('should return 1 for small differences between bounds', () => {
    expect(computeAdaptiveStep(0, 1)).toBe(1);
    expect(computeAdaptiveStep(10, 11)).toBe(1);
  });
});
