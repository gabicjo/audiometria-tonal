import { testConfig, toneLimits } from '../config/constants.js';

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
    gainNode.gain.value = mapVolumePercentToGain(volumePercent);

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
        const nextGain = mapVolumePercentToGain(nextVolumePercent);
        gainNode.gain.cancelScheduledValues(audioContext.currentTime);
        gainNode.gain.setTargetAtTime(nextGain, audioContext.currentTime, 0.02);
    }

    return { stop, updateVolume };
}

/**
 * Converte volume percentual para ganho com curva perceptual.
 * A escala em dB torna as mudanças de volume mais perceptíveis em celulares.
 * @param {number} volumePercent Volume percentual.
 * @returns {number} Ganho linear para o Web Audio.
 */
function mapVolumePercentToGain(volumePercent) {
    const clampedPercent = Math.max(0, Math.min(volumePercent, 100));
    if (clampedPercent === 0) return 0;
    return (clampedPercent / 100) * testConfig.maxOutputGain;
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
