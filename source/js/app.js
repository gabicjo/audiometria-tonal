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

// Detecta pressione da tecla '9' e emite o tom com valores atuais de frequência e volume do HTML
let pararSomAtual = null;

window.addEventListener('keydown', function(event) {
    // Verifica se '9' foi pressionado e não está repetindo o evento se segurado
    if ((event.key === '9' || event.keyCode === 57) && !event.repeat) {
        // Obtém frequência e volume dos elementos na página
        const freqElem = document.getElementById('frequencia-number');
        const volElem = document.getElementById('volume-number');
        if (!freqElem || !volElem) return;

        const frequencia = parseFloat(freqElem.textContent);
        const volume = parseFloat(volElem.textContent);

        // Se já tem tom tocando, para ele antes de tocar novo
        if (typeof pararSomAtual === 'function') {
            pararSomAtual();
            pararSomAtual = null;
        }
        // Emite o novo tom
        pararSomAtual = emitirTonal(frequencia, volume);
    }
});

// Se desejar: parar o som ao soltar a tecla '9'
window.addEventListener('keyup', function(event) {
    if ((event.key === '9' || event.keyCode === 57)) {
        if (typeof pararSomAtual === 'function') {
            pararSomAtual();
            pararSomAtual = null;
        }
    }
});