import { computeAdaptiveStep } from '../logic/volumeAdjustment.js';
import { testConfig } from '../config/constants.js';

/**
 * Cria e gerencia o estado da sessão de teste auditivo.
 * @param {{getVolumeText: () => string, setVolumeText: (value: number) => void}} volumeBindings Acesso à UI de volume.
 * @param {(volume: number) => void} onVolumeChanged Callback disparado após alteração de volume.
 * @returns {{getVolume: function, setVolume: function, markHeard: function, markNotHeard: function, resetForNewFrequency: function}} API de estado.
 */
export function createTestState(volumeBindings, onVolumeChanged) {
    let currentStep = testConfig.initialStep;
    let lastHeardVolume = null;
    let lastNotHeardVolume = null;

    /**
     * Retorna o volume atual da interface.
     * @returns {number} Volume atual.
     */
    function getVolume() {
        return parseInt(volumeBindings.getVolumeText(), 10);
    }

    /**
     * Define volume com clamp e notifica integração externa.
     * @param {number} nextVolume Próximo volume.
     * @returns {void}
     */
    function setVolume(nextVolume) {
        let clamped = Math.round(nextVolume);
        if (clamped > testConfig.maxVolume) clamped = testConfig.maxVolume;
        if (clamped < testConfig.minVolume) clamped = testConfig.minVolume;
        volumeBindings.setVolumeText(clamped);
        onVolumeChanged(clamped);
    }

    /**
     * Processa clique em "Escutou".
     * @returns {void}
     */
    function markHeard() {
        const currentVolume = getVolume();
        lastHeardVolume = currentVolume;
        if (lastNotHeardVolume !== null) {
            const midpoint = Math.round((lastHeardVolume + lastNotHeardVolume) / 2);
            currentStep = computeAdaptiveStep(lastHeardVolume, lastNotHeardVolume);
            setVolume(midpoint);
            return;
        }
        setVolume(currentVolume - currentStep);
    }

    /**
     * Processa clique em "Não escutou".
     * @returns {void}
     */
    function markNotHeard() {
        const currentVolume = getVolume();
        lastNotHeardVolume = currentVolume;
        if (lastHeardVolume !== null) {
            const midpoint = Math.round((lastHeardVolume + lastNotHeardVolume) / 2);
            currentStep = computeAdaptiveStep(lastHeardVolume, lastNotHeardVolume);
            setVolume(midpoint);
            return;
        }
        setVolume(currentVolume + currentStep);
    }

    /**
     * Reseta estado adaptativo e volume para nova frequência.
     * @returns {void}
     */
    function resetForNewFrequency() {
        lastHeardVolume = null;
        lastNotHeardVolume = null;
        currentStep = testConfig.initialStep;
        setVolume(testConfig.initialVolume);
    }

    return { getVolume, setVolume, markHeard, markNotHeard, resetForNewFrequency };
}
