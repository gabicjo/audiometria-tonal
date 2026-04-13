import { jest, describe, beforeEach, afterEach, test, expect } from '@jest/globals';
import { testConfig } from '../../js/config/constants.js';
const createToneSessionMock = jest.fn(() => ({
  stop: jest.fn(),
  updateVolume: jest.fn(),
}));
jest.unstable_mockModule('../../js/audio/toneEngine.js', () => ({
  createToneSession: createToneSessionMock,
}));
const { createEmissionController } = await import('../../js/audio/emissionController.js');

describe('createEmissionController (Integration)', () => {
  let getFrequencyHzMock;
  let getVolumePercentMock;
  let emissionController;
  let mockToneSession;
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    getFrequencyHzMock = jest.fn(() => 1000);
    getVolumePercentMock = jest.fn(() => 50);
    mockToneSession = {
      stop: jest.fn(),
      updateVolume: jest.fn(),
    };
    createToneSessionMock.mockReturnValue(mockToneSession);
    emissionController = createEmissionController(getFrequencyHzMock, getVolumePercentMock);
  });
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });
  test('start should create a new tone session and start monitoring', () => {
    emissionController.start();
    expect(createToneSessionMock).toHaveBeenCalledTimes(1);
    expect(createToneSessionMock).toHaveBeenCalledWith(1000, 50);
    expect(emissionController.isPlaying()).toBe(true);
    jest.advanceTimersByTime(testConfig.monitorIntervalMs);
    expect(mockToneSession.updateVolume).toHaveBeenCalledTimes(1);
    expect(mockToneSession.updateVolume).toHaveBeenCalledWith(50);
  });
  test('stop should stop the current tone session and monitoring', () => {
    emissionController.start();
    emissionController.stop();
    expect(mockToneSession.stop).toHaveBeenCalledTimes(1);
    expect(emissionController.isPlaying()).toBe(false);
    jest.advanceTimersByTime(testConfig.monitorIntervalMs);
    expect(mockToneSession.updateVolume).not.toHaveBeenCalled();
  });
  test('updateVolume should call updateVolume on the current tone session', () => {
    emissionController.start();
    emissionController.updateVolume(75);
    expect(mockToneSession.updateVolume).toHaveBeenCalledWith(75);
  });
  test('start should stop existing session before creating a new one', () => {
    emissionController.start();
    const firstSession = mockToneSession;
    expect(createToneSessionMock).toHaveBeenCalledTimes(1);
    emissionController.start();
    expect(firstSession.stop).toHaveBeenCalledTimes(1);
    expect(createToneSessionMock).toHaveBeenCalledTimes(2);
  });
  test('should not update volume if no session is active', () => {
    emissionController.updateVolume(75);
    expect(mockToneSession.updateVolume).not.toHaveBeenCalled();
  });
  test('monitor should continuously update volume', () => {
    emissionController.start();
    jest.advanceTimersByTime(testConfig.monitorIntervalMs);
    expect(mockToneSession.updateVolume).toHaveBeenCalledWith(50);
    getVolumePercentMock.mockReturnValue(60);
    jest.advanceTimersByTime(testConfig.monitorIntervalMs);
    expect(mockToneSession.updateVolume).toHaveBeenCalledWith(60);
    expect(mockToneSession.updateVolume).toHaveBeenCalledTimes(2);
  });
  test('stop should clear the monitor interval', () => {
    emissionController.start();
    jest.advanceTimersByTime(testConfig.monitorIntervalMs);
    emissionController.stop();
    jest.advanceTimersByTime(testConfig.monitorIntervalMs * 2);
    expect(mockToneSession.updateVolume).toHaveBeenCalledTimes(1);
  });
});
