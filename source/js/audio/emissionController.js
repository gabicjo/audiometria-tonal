import { createToneSession } from './toneEngine.js';
import { testConfig } from '../config/constants.js';

/**
 * Cria o controlador de emissão e monitoramento de volume.
 * @param {() => number} getFrequencyHz Leitor da frequência atual.
 * @param {() => number} getVolumePercent Leitor do volume atual.
 * @returns {{start: function, stop: function, isPlaying: function, updateVolume: function}} API de controle.
 */
export function createEmissionController(getFrequencyHz, getVolumePercent) {
    let currentSession = null;
    let isMonitoring = false;
    let monitorIntervalId = null;

    /**
     * Inicia emissão com frequência e volume atuais.
     * @returns {void}
     */
    function start() {
        const frequencyHz = getFrequencyHz();
        const volumePercent = getVolumePercent();
        stop();
        currentSession = createToneSession(frequencyHz, volumePercent);
        startVolumeMonitor();
    }

    /**
     * Interrompe emissão e monitoramento ativos.
     * @returns {void}
     */
    function stop() {
        if (currentSession && typeof currentSession.stop === 'function') {
            currentSession.stop();
        }
        currentSession = null;
        stopVolumeMonitor();
    }

    /**
     * Informa se existe sessão de áudio ativa.
     * @returns {boolean} Verdadeiro quando há áudio tocando.
     */
    function isPlaying() {
        return Boolean(currentSession);
    }

    /**
     * Atualiza imediatamente o volume da sessão ativa.
     * @param {number} nextVolumePercent Novo volume percentual.
     * @returns {void}
     */
    function updateVolume(nextVolumePercent) {
        if (!currentSession || typeof currentSession.updateVolume !== 'function') return;
        currentSession.updateVolume(nextVolumePercent);
    }

    /**
     * Inicia monitoramento periódico de volume da sessão ativa.
     * @returns {void}
     */
    function startVolumeMonitor() {
        if (isMonitoring || !currentSession) return;
        isMonitoring = true;
        monitorIntervalId = setInterval(() => {
            if (!currentSession || typeof currentSession.updateVolume !== 'function') return;
            currentSession.updateVolume(getVolumePercent());
        }, testConfig.monitorIntervalMs);
    }

    /**
     * Encerra monitoramento periódico de volume.
     * @returns {void}
     */
    function stopVolumeMonitor() {
        isMonitoring = false;
        if (!monitorIntervalId) return;
        clearInterval(monitorIntervalId);
        monitorIntervalId = null;
    }

    return { start, stop, isPlaying, updateVolume };
}
