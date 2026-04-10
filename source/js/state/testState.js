import { testConfig } from '../config/constants.js';

/**
 * Cria e gerencia o estado da sessão de teste auditivo.
 * @param {{getVolumeText: () => string, setVolumeText: (value: number) => void}} volumeBindings Acesso à UI de volume.
 * @param {(volume: number) => void} onVolumeChanged Callback disparado após alteração de volume.
 * @returns {{getVolume: function, setVolume: function, markHeard: function, markNotHeard: function, resetForNewFrequency: function}} API de estado.
 */
export function createTestState(volumeBindings, onVolumeChanged) {
    /**
     * Retorna o volume atual da interface.
     * @returns {number} Volume atual.
     */
    function getVolume() {
        const parsed = parseFloat(volumeBindings.getVolumeText());
        return Number.isFinite(parsed) ? parsed : testConfig.minVolume;
    }

    /**
     * Define volume com clamp e notifica integração externa.
     * @param {number} nextVolume Próximo volume.
     * @returns {void}
     */
    function setVolume(nextVolume) {
        let clamped = Math.round(nextVolume * 10) / 10;
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
        const currentGain = volumePercentToGain(getVolume());
        const reducedGain = currentGain * testConfig.heardDecreaseFactor;
        const nextGain = Math.max(testConfig.minAudibleOutputGain, reducedGain);
        setVolume(gainToVolumePercent(nextGain));
    }

    /**
     * Processa clique em "Não escutou".
     * @returns {void}
     */
    function markNotHeard() {
        const currentGain = volumePercentToGain(getVolume());
        const raisedGain = currentGain * testConfig.notHeardIncreaseFactor;
        const nextGain = Math.min(testConfig.maxOutputGain, raisedGain);
        setVolume(gainToVolumePercent(nextGain));
    }

    /**
     * Reseta estado adaptativo e volume para nova frequência.
     * @returns {void}
     */
    function resetForNewFrequency() {
        setVolume(gainToVolumePercent(testConfig.initialOutputGain));
    }

    return { getVolume, setVolume, markHeard, markNotHeard, resetForNewFrequency };
}

/**
 * Converte percentual de UI para ganho de saída.
 * @param {number} volumePercent Valor percentual exibido na interface.
 * @returns {number} Ganho logaritimico.
 */
function volumePercentToGain(volumePercent) {
  const percent = Math.max(0, Math.min(volumePercent, 100)) / 100;

  // curva log aproximada (mais realista pro ouvido)
  return testConfig.maxOutputGain * Math.pow(percent, 2);
}

/**
 * Converte ganho de saída para percentual de UI.
 * @param {number} outputGain Ganho logaritmico de saída.
 * @returns {number} Percentual equivalente.
 */
function gainToVolumePercent(outputGain) {
  const clampedGain = Math.max(
    0,
    Math.min(outputGain, testConfig.maxOutputGain),
  );

  const normalized = clampedGain / testConfig.maxOutputGain;

  return Math.pow(normalized, 1 / 2) * 100;
}
