/**
 * Emite um ruído puro (senoidal) na frequência e volume desejados.
 * @param {number} frequencia - Frequência em Hz
 * @param {number} volume - Volume percentual (0 a 100)
 */
function emitirTonal(frequencia, volume) {
    // Cria contexto de áudio
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();

    // Cria um oscilador (onda senoidal)
    const oscillator = audioCtx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequencia;

    // Cria um nó de ganho para controlar o volume
    const gainNode = audioCtx.createGain();
    const ganhoNormalizado = Math.max(0, Math.min(volume, 100)) / 100;
    gainNode.gain.value = ganhoNormalizado;

    // Conecta: Oscilador → Ganho → Destino (alto-falante)
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Inicia o ruído
    oscillator.start();

    // Retorna uma função para parar o som manualmente
    return function parar() {
        oscillator.stop();
        audioCtx.close();
    };
}