/**
 * Emite um ruído puro (senoidal) na frequência e volume desejados.
 * O objeto retornado agora permite atualizar o volume "ao vivo" conforme o valor muda no HTML.
 * @param {number} frequencia - Frequência em Hz
 * @param {number} volume - Volume percentual (0 a 100)
 * @returns {object} { parar, atualizarVolume }
 */
function emitirTonal(frequencia, volume) {
    if (frequencia < 8000) {
        frequencia = 8000;
    }

    // Cria contexto de áudio
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();

    // Cria um oscilador (onda senoidal)
    const oscillator = audioCtx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequencia;

    // Cria um nó de ganho para controlar o volume
    const gainNode = audioCtx.createGain();
    // Função utilitária interna para normalizar volume (0-100 para 0-1)
    function getGanho(v) { return Math.max(0, Math.min(v, 100)) / 100; }
    gainNode.gain.value = getGanho(volume);

    // Conecta: Oscilador → Ganho → Destino (alto-falante)
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    let tocando = true;

    // Inicia o ruído
    oscillator.start();

    // Função para parar o som manualmente
    function parar() {
        if (tocando) {
            oscillator.stop();
            audioCtx.close();
            tocando = false;
        }
    }

    // Função para atualizar o volume "ao vivo"
    function atualizarVolume(novoVolume) {
        gainNode.gain.setValueAtTime(getGanho(novoVolume), audioCtx.currentTime);
    }

    return {
        parar,
        atualizarVolume
    };
}

// Detecta pressione da tecla '9' e emite o tom com valores atuais de frequência e volume do HTML
let somAtual = null;
let monitorandoVolume = false;
let volumeInterval = null;

function iniciarMonitoramentoVolume() {
    if (monitorandoVolume || !somAtual) return;
    monitorandoVolume = true;
    volumeInterval = setInterval(() => {
        const volElem = document.getElementById('volume-number');
        if (somAtual && volElem) {
            const volume = parseFloat(volElem.textContent);
            somAtual.atualizarVolume(volume);
        }
    }, 80); // atualização rápida permite resposta em tempo real
}

function pararMonitoramentoVolume() {
    monitorandoVolume = false;
    if (volumeInterval) {
        clearInterval(volumeInterval);
        volumeInterval = null;
    }
}

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
        if (somAtual && typeof somAtual.parar === 'function') {
            somAtual.parar();
            somAtual = null;
        }
        // Emite o novo tom
        somAtual = emitirTonal(frequencia, volume);
        iniciarMonitoramentoVolume();
    }
});

// Parar o som ao soltar a tecla '9'
window.addEventListener('keyup', function(event) {
    if ((event.key === '9' || event.keyCode === 57)) {
        if (somAtual && typeof somAtual.parar === 'function') {
            somAtual.parar();
            somAtual = null;
        }
        pararMonitoramentoVolume();
    }
});

// Seleciona os elementos dos botões e do volume
const btnEscutou = document.getElementById('escutou');
const btnNaoEscutou = document.getElementById('nao-escutou');
const volElem = document.getElementById('volume-number');
const VOLUME_MIN = 0;
const VOLUME_MAX = 100;

// Define o passo inicial e vai adaptando conforme necessidade
let passoVolume = 5;

// Função para decidir novo passo: binário adaptativo (reduz passo pela metade sempre que possível)
function ajustarPassoVolume(valorAntes, valorDepois) {
    const diff = Math.abs(valorDepois - valorAntes);
    if (diff <= 1) return 1; // granulação mínima
    return Math.max(1, Math.floor(diff / 2));
}

// Controla o intervalo de busca entre 2 valores quando estamos refinando o limiar
let ultimoVolumeEscutou = null;
let ultimoVolumeNaoEscutou = null;

function setVolume(novoVolume) {
    let v = Math.round(novoVolume);
    if (v > VOLUME_MAX) v = VOLUME_MAX;
    if (v < VOLUME_MIN) v = VOLUME_MIN;
    volElem.textContent = v;

    // Se estiver emitindo som, atualiza o volume em tempo real
    if (somAtual && typeof somAtual.atualizarVolume === 'function') {
        somAtual.atualizarVolume(v);
    }
}

// Quando usuário escutou: diminui o volume
btnEscutou.addEventListener('click', () => {
    let atual = parseInt(volElem.textContent, 10);

    // Marca limites para ajuste adaptativo
    ultimoVolumeEscutou = atual;
    if (ultimoVolumeNaoEscutou !== null) {
        // Busca binária entre escutou e não-escutou
        let novo = Math.round((ultimoVolumeEscutou + ultimoVolumeNaoEscutou) / 2);
        passoVolume = ajustarPassoVolume(ultimoVolumeEscutou, ultimoVolumeNaoEscutou);
        setVolume(novo);
    } else {
        setVolume(atual - passoVolume);
    }
});

// Quando usuário não escutou: aumenta o volume
btnNaoEscutou.addEventListener('click', () => {
    let atual = parseInt(volElem.textContent, 10);

    // Marca limites para ajuste adaptativo
    ultimoVolumeNaoEscutou = atual;
    if (ultimoVolumeEscutou !== null) {
        let novo = Math.round((ultimoVolumeEscutou + ultimoVolumeNaoEscutou) / 2);
        passoVolume = ajustarPassoVolume(ultimoVolumeEscutou, ultimoVolumeNaoEscutou);
        setVolume(novo);
    } else {
        setVolume(atual + passoVolume);
    }
});

// Sempre que a frequência mudar, ou usuário clicar em "Próximo", zere limites de busca
const btnProximo = document.getElementById('proximo');
btnProximo && btnProximo.addEventListener('click', () => {
    ultimoVolumeEscutou = null;
    ultimoVolumeNaoEscutou = null;
    passoVolume = 5;
});
