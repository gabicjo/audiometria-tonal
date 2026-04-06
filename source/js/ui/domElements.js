/**
 * Retorna referências dos elementos principais da interface.
 * @returns {object} Mapa de elementos de UI.
 */
export function getDomElements() {
    return {
        startPage: document.getElementById('start-page'),
        examPage: document.getElementById('exam-page'),
        startButton: document.getElementById('start-button'),
        mobilePlayToneButton: document.getElementById('mobile-play-tone'),
        btnEscutou: document.getElementById('escutou'),
        btnNaoEscutou: document.getElementById('nao-escutou'),
        btnProximo: document.getElementById('proximo'),
        frequencyNumber: document.getElementById('frequencia-number'),
        volumeNumber: document.getElementById('volume-number')
    };
}
