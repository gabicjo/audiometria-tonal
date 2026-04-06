import { toneLimits } from '../config/constants.js';

/**
 * Cria e inicia um tom senoidal com controle de volume em tempo real.
 * @param {number} frequencyHz Frequência desejada em Hz.
 * @param {number} volumePercent Volume percentual entre 0 e 100.
 * @returns {{stop: function, updateVolume: function}} Controle do tom ativo.
 */
export function createToneSession(frequencyHz, volumePercent) {
    const clampedFrequency = clampFrequency(frequencyHz);
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContextCtor();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = clampedFrequency;
    gainNode.gain.value = normalizeVolume(volumePercent);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start();

    let isPlaying = true;

    /**
     * Encerra a sessão de áudio ativa.
     * @returns {void}
     */
    function stop() {
        if (!isPlaying) return;
        oscillator.stop();
        audioContext.close();
        isPlaying = false;
    }

    /**
     * Atualiza o ganho da sessão de áudio em tempo real.
     * @param {number} nextVolumePercent Novo volume percentual.
     * @returns {void}
     */
    function updateVolume(nextVolumePercent) {
        gainNode.gain.setValueAtTime(normalizeVolume(nextVolumePercent), audioContext.currentTime);
    }

    return { stop, updateVolume };
}

/**
 * Normaliza o volume percentual para ganho entre 0 e 1.
 * @param {number} volumePercent Volume percentual.
 * @returns {number} Ganho normalizado.
 */
function normalizeVolume(volumePercent) {
    return Math.max(0, Math.min(volumePercent, 100)) / 100;
}

/**
 * Limita a frequência para a faixa audível definida.
 * @param {number} frequencyHz Frequência de entrada.
 * @returns {number} Frequência ajustada.
 */
function clampFrequency(frequencyHz) {
    if (frequencyHz < toneLimits.minFrequencyHz) return toneLimits.minFrequencyHz;
    if (frequencyHz > toneLimits.maxFrequencyHz) return toneLimits.maxFrequencyHz;
    return frequencyHz;
}
