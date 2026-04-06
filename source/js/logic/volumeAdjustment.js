/**
 * Calcula o passo adaptativo de ajuste de volume.
 * @param {number} lowerBound Primeiro limite observado.
 * @param {number} upperBound Segundo limite observado.
 * @returns {number} Novo passo de ajuste.
 */
export function computeAdaptiveStep(lowerBound, upperBound) {
    const diff = Math.abs(upperBound - lowerBound);
    if (diff <= 1) return 1;
    return Math.max(1, Math.floor(diff / 2));
}
