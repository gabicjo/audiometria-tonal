
import { createTestState } from '../../js/state/testState.js';

describe('createTestState', () => {
  let mockVolumeTextFunctions;
  let mockVolumeUpdateCallback;
  let testState;

  beforeEach(() => {
    mockVolumeTextFunctions = {
      getVolumeText: jest.fn(() => '50'),
      setVolumeText: jest.fn(),
    };
    mockVolumeUpdateCallback = jest.fn();
    testState = createTestState(mockVolumeTextFunctions, mockVolumeUpdateCallback);
  });

  test('should initialize with default values and update DOM text', () => {
    expect(testState.getVolume()).toBe(50);
    expect(mockVolumeTextFunctions.setVolumeText).toHaveBeenCalledWith(50);
    expect(testState.getFrequency()).toBe(0);
  });

  test('should set frequency correctly', () => {
    testState.setFrequency(1000);
    expect(testState.getFrequency()).toBe(1000);
  });

  test('should increment volume and call update callback', () => {
    testState.incrementVolume();
    expect(testState.getVolume()).toBe(55);
    expect(mockVolumeTextFunctions.setVolumeText).toHaveBeenCalledWith(55);
    expect(mockVolumeUpdateCallback).toHaveBeenCalledWith(55);
  });

  test('should decrement volume and call update callback', () => {
    testState.decrementVolume();
    expect(testState.getVolume()).toBe(45);
    expect(mockVolumeTextFunctions.setVolumeText).toHaveBeenCalledWith(45);
    expect(mockVolumeUpdateCallback).toHaveBeenCalledWith(45);
  });

  test('should reset volume and frequency for new frequency', () => {
    testState.setFrequency(2000);
    testState.incrementVolume(); // Volume becomes 55
    testState.resetForNewFrequency();
    expect(testState.getVolume()).toBe(0);
    expect(mockVolumeTextFunctions.setVolumeText).toHaveBeenCalledWith(0);
    expect(testState.getFrequency()).toBe(2000); // Frequency should remain the same
    expect(mockVolumeUpdateCallback).toHaveBeenCalledWith(0); // Callback should be called with new volume
  });

  test('should not increment volume beyond max limit', () => {
    for (let i = 0; i < 20; i++) { // Max volume is 100, starting at 50, increment by 5
      testState.incrementVolume();
    }
    expect(testState.getVolume()).toBe(100);
    expect(mockVolumeTextFunctions.setVolumeText).toHaveBeenCalledWith(100);
  });

  test('should not decrement volume below min limit', () => {
    for (let i = 0; i < 20; i++) { // Min volume is 0, starting at 50, decrement by 5
      testState.decrementVolume();
    }
    expect(testState.getVolume()).toBe(0);
    expect(mockVolumeTextFunctions.setVolumeText).toHaveBeenCalledWith(0);
  });
});
