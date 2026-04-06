import { createEmissionController } from './audio/emissionController.js';
import { createTestState } from './state/testState.js';
import { getDomElements } from './ui/domElements.js';
import { bindUiEvents } from './ui/events.js';

const elements = getDomElements();

const testState = createTestState(
    {
        getVolumeText: () => elements.volumeNumber?.textContent || '0',
        setVolumeText: (value) => {
            if (elements.volumeNumber) elements.volumeNumber.textContent = String(value);
        }
    },
    (volume) => {
        emissionController.updateVolume(volume);
    }
);

const emissionController = createEmissionController(
    () => parseFloat(elements.frequencyNumber?.textContent || '0'),
    () => testState.getVolume()
);

bindUiEvents({ elements, emissionController, testState });
