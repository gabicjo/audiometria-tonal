import { availableFrequenciesHz } from '../config/constants.js';
import { openFrequencyModal } from './frequencyModal.js';

/**
 * Registra todos os eventos de interface e entrada de usuário.
 * @param {object} context Dependências da camada de UI.
 * @param {object} context.elements Elementos de interface.
 * @param {object} context.emissionController Controlador de emissão.
 * @param {object} context.testState Estado do teste.
 * @returns {void}
 */
export function bindUiEvents({ elements, emissionController, testState }) {
    const {
        startPage,
        examPage,
        startButton,
        mobilePlayToneButton,
        btnEscutou,
        btnNaoEscutou,
        btnProximo,
        frequencyNumber
    } = elements;

    window.addEventListener('keydown', (event) => {
        if ((event.key === '9' || event.keyCode === 57) && !event.repeat) {
            emissionController.start();
        }
    });

    window.addEventListener('keyup', (event) => {
        if (event.key === '9' || event.keyCode === 57) {
            emissionController.stop();
        }
    });

    if (startButton) {
        startButton.addEventListener('click', () => {
            if (startPage) {
                startPage.classList.add('ocultar');
                startPage.classList.remove('mostrar');
            }
            if (examPage) {
                examPage.classList.remove('ocultar');
                examPage.classList.add('mostrar');
            }
        });
    }

    if (mobilePlayToneButton) {
        const onPointerDown = (event) => {
            event.preventDefault();
            emissionController.start();
        };
        const onPointerUp = (event) => {
            event.preventDefault();
            emissionController.stop();
        };

        mobilePlayToneButton.addEventListener('pointerdown', onPointerDown);
        mobilePlayToneButton.addEventListener('pointerup', onPointerUp);
        mobilePlayToneButton.addEventListener('pointercancel', onPointerUp);
        mobilePlayToneButton.addEventListener('pointerleave', onPointerUp);
    }

    if (btnEscutou) btnEscutou.addEventListener('click', () => testState.markHeard());
    if (btnNaoEscutou) btnNaoEscutou.addEventListener('click', () => testState.markNotHeard());

    if (btnProximo && frequencyNumber) {
        btnProximo.addEventListener('click', async () => {
            const currentFrequencyHz = parseInt(frequencyNumber.textContent, 10) || availableFrequenciesHz[0];
            const selectedFrequencyHz = await openFrequencyModal({
                frequenciesHz: availableFrequenciesHz,
                currentFrequencyHz
            });
            if (selectedFrequencyHz === null) return;
            frequencyNumber.textContent = String(selectedFrequencyHz);
            testState.resetForNewFrequency();
            emissionController.stop();
        });
    }
}
