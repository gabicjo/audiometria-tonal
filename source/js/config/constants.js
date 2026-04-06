export const toneLimits = {
    minFrequencyHz: 20,
    maxFrequencyHz: 20000
};

export const testConfig = {
    minVolume: 0,
    maxVolume: 100,
    monitorIntervalMs: 80,
    maxOutputGain: 0.2,
    initialOutputGain: 0.1,
    minAudibleOutputGain: 0.001,
    heardDecreaseFactor: 0.7,
    notHeardIncreaseFactor: 1.25
};

export const availableFrequenciesHz = [250, 500, 1000, 2000, 4000];
