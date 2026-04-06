/**
 * Abre o modal de seleção de frequência e resolve com o valor escolhido.
 * @param {{frequenciesHz: number[], currentFrequencyHz: number}} options Configuração do modal.
 * @returns {Promise<number|null>} Frequência escolhida ou nulo em cancelamento.
 */
export function openFrequencyModal({ frequenciesHz, currentFrequencyHz }) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'freq-modal-overlay';

        const modal = document.createElement('div');
        modal.className = 'freq-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'freq-modal-title');

        const initialOption = frequenciesHz.includes(currentFrequencyHz)
            ? currentFrequencyHz
            : frequenciesHz[0];

        modal.innerHTML = `
            <h3 id="freq-modal-title">Selecione a frequência</h3>
            <form id="freq-modal-form">
                <div class="freq-options">
                    ${frequenciesHz.map((frequencyHz) => `
                        <label class="freq-option">
                            <input type="radio" name="frequencia" value="${frequencyHz}" ${frequencyHz === initialOption ? 'checked' : ''}>
                            <span>${frequencyHz} Hz</span>
                        </label>
                    `).join('')}
                </div>
                <div class="freq-modal-actions">
                    <button type="button" class="freq-btn freq-btn-secondary" id="freq-cancelar">Cancelar</button>
                    <button type="submit" class="freq-btn freq-btn-primary">Confirmar</button>
                </div>
            </form>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        const form = modal.querySelector('#freq-modal-form');
        const cancelButton = modal.querySelector('#freq-cancelar');
        const firstRadio = modal.querySelector('input[name="frequencia"]');

        /**
         * Fecha modal e resolve o valor selecionado.
         * @param {number|null} selectedFrequency Frequência selecionada ou nulo.
         * @returns {void}
         */
        function close(selectedFrequency) {
            overlay.remove();
            window.removeEventListener('keydown', onEscape);
            resolve(selectedFrequency);
        }

        /**
         * Fecha modal ao pressionar Escape.
         * @param {KeyboardEvent} event Evento de teclado.
         * @returns {void}
         */
        function onEscape(event) {
            if (event.key === 'Escape') close(null);
        }

        cancelButton.addEventListener('click', () => close(null));
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) close(null);
        });
        window.addEventListener('keydown', onEscape);

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const selectedInput = form.querySelector('input[name="frequencia"]:checked');
            if (!selectedInput) {
                close(null);
                return;
            }
            close(parseInt(selectedInput.value, 10));
        });

        if (firstRadio) firstRadio.focus();
    });
}
