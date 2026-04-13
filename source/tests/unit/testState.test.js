import { jest, describe, beforeEach, test, expect } from '@jest/globals';
import { createTestState } from '../../js/state/testState.js';
import { testConfig } from '../../js/config/constants.js';

describe('createTestState', () => {
  let currentVolume;
  let mockSetVolumeText;
  let mockVolumeBindings;
  let mockVolumeUpdateCallback;
  let testState;

  beforeEach(() => {
    currentVolume = 50;
    mockSetVolumeText = jest.fn((value) => {
      currentVolume = value;
    });
    mockVolumeBindings = {
      getVolumeText: jest.fn(() => String(currentVolume)),
      setVolumeText: mockSetVolumeText,
    };
    mockVolumeUpdateCallback = jest.fn();
    testState = createTestState(mockVolumeBindings, mockVolumeUpdateCallback);
  });

  test('should read current volume from bindings', () => {
    expect(testState.getVolume()).toBe(50);
  });

  test('should set volume and notify callback', () => {
    testState.setVolume(55);
    expect(testState.getVolume()).toBe(55);
    expect(mockSetVolumeText).toHaveBeenCalledWith(55);
    expect(mockVolumeUpdateCallback).toHaveBeenCalledWith(55);
  });

  test('should round to one decimal place when setting volume', () => {
    testState.setVolume(62.56);
    expect(testState.getVolume()).toBe(62.6);
    expect(mockSetVolumeText).toHaveBeenCalledWith(62.6);
  });

  test('should clamp volume to min and max bounds', () => {
    testState.setVolume(testConfig.maxVolume + 10);
    expect(testState.getVolume()).toBe(testConfig.maxVolume);
    expect(mockSetVolumeText).toHaveBeenCalledWith(testConfig.maxVolume);
    testState.setVolume(testConfig.minVolume - 10);
    expect(testState.getVolume()).toBe(testConfig.minVolume);
    expect(mockSetVolumeText).toHaveBeenCalledWith(testConfig.minVolume);
  });

  test('markHeard should reduce volume based on heard factor', () => {
    testState.markHeard();
    expect(testState.getVolume()).toBe(35);
    expect(mockSetVolumeText).toHaveBeenCalledWith(35);
    expect(mockVolumeUpdateCallback).toHaveBeenCalledWith(35);
  });

  test('markNotHeard should increase volume based on not-heard factor', () => {
    testState.markNotHeard();
    expect(testState.getVolume()).toBe(62.5);
    expect(mockSetVolumeText).toHaveBeenCalledWith(62.5);
    expect(mockVolumeUpdateCallback).toHaveBeenCalledWith(62.5);
  });

  test('markHeard should not go below minimum audible gain', () => {
    currentVolume = 0;
    testState.markHeard();
    expect(testState.getVolume()).toBe(1);
    expect(mockSetVolumeText).toHaveBeenCalledWith(1);
  });

  test('markNotHeard should not exceed max output gain', () => {
    currentVolume = 100;
    testState.markNotHeard();
    expect(testState.getVolume()).toBe(100);
    expect(mockSetVolumeText).toHaveBeenCalledWith(100);
  });

  test('should reset volume to initial output gain for new frequency', () => {
    testState.setVolume(40);
    testState.resetForNewFrequency();
    expect(testState.getVolume()).toBe(100);
    expect(mockSetVolumeText).toHaveBeenCalledWith(100);
    expect(mockVolumeUpdateCallback).toHaveBeenCalledWith(100);
  });
});
