import { jest, describe, beforeEach, test, expect } from '@jest/globals';
import { createToneSession } from '../../js/audio/toneEngine.js';
import { testConfig, toneLimits } from '../../js/config/constants.js';

// Mocking the Web Audio API
const mockAudioContext = {
  createOscillator: jest.fn(() => ({ 
    type: '',
    frequency: { value: 0 },
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
  })),
  createGain: jest.fn(() => ({
    gain: { value: 0, cancelScheduledValues: jest.fn(), setTargetAtTime: jest.fn() },
    connect: jest.fn(),
  })),
  destination: {},
  currentTime: 0,
  close: jest.fn(),
};

const mockWindow = {
  AudioContext: jest.fn(() => mockAudioContext),
  webkitAudioContext: jest.fn(() => mockAudioContext),
};

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true,
});

describe('createToneSession', () => {
  let toneSession;

  beforeEach(() => {
    jest.clearAllMocks();
    toneSession = createToneSession(1000, 50); // Default frequency and volume
  });

  test('should create an AudioContext, Oscillator, and GainNode', () => {
    expect(mockWindow.AudioContext).toHaveBeenCalledTimes(1);
    expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(1);
    expect(mockAudioContext.createGain).toHaveBeenCalledTimes(1);
  });

  test('should set oscillator properties and connect nodes', () => {
    const oscillator = mockAudioContext.createOscillator.mock.results[0].value;
    const gainNode = mockAudioContext.createGain.mock.results[0].value;

    expect(oscillator.type).toBe('sine');
    expect(oscillator.frequency.value).toBe(1000);
    expect(gainNode.gain.value).toBe((50 / 100) * testConfig.maxOutputGain);
    expect(oscillator.connect).toHaveBeenCalledWith(gainNode);
    expect(gainNode.connect).toHaveBeenCalledWith(mockAudioContext.destination);
    expect(oscillator.start).toHaveBeenCalledTimes(1);
  });

  test('stop function should stop oscillator and close audio context', () => {
    const oscillator = mockAudioContext.createOscillator.mock.results[0].value;
    toneSession.stop();
    expect(oscillator.stop).toHaveBeenCalledTimes(1);
    expect(mockAudioContext.close).toHaveBeenCalledTimes(1);
  });

  test('updateVolume should adjust gainNode gain', () => {
    const gainNode = mockAudioContext.createGain.mock.results[0].value;
    toneSession.updateVolume(75);
    const expectedGain = (75 / 100) * testConfig.maxOutputGain;
    expect(gainNode.gain.cancelScheduledValues).toHaveBeenCalledWith(mockAudioContext.currentTime);
    expect(gainNode.gain.setTargetAtTime).toHaveBeenCalledWith(expectedGain, mockAudioContext.currentTime, 0.02);
  });

  test('should clamp frequency to min and max limits', () => {
    jest.clearAllMocks();
    createToneSession(toneLimits.minFrequencyHz - 100, 50);
    const oscillator = mockAudioContext.createOscillator.mock.results[0].value;
    expect(oscillator.frequency.value).toBe(toneLimits.minFrequencyHz);

    jest.clearAllMocks();
    createToneSession(toneLimits.maxFrequencyHz + 100, 50);
    const oscillator2 = mockAudioContext.createOscillator.mock.results[0].value;
    expect(oscillator2.frequency.value).toBe(toneLimits.maxFrequencyHz);
  });

  test('should map 0 volume percent to 0 gain', () => {
    jest.clearAllMocks();
    createToneSession(1000, 0);
    const gainNode = mockAudioContext.createGain.mock.results[0].value;
    expect(gainNode.gain.value).toBe(0);
  });

  test('should not stop if already stopped', () => {
    const oscillator = mockAudioContext.createOscillator.mock.results[0].value;
    toneSession.stop();
    toneSession.stop(); // Call stop again
    expect(oscillator.stop).toHaveBeenCalledTimes(1);
    expect(mockAudioContext.close).toHaveBeenCalledTimes(1);
  });
});