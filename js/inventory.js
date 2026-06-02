/**
 * CallKeeper — Módulo de Inventário
 */

const Inventory = (() => {

    /**
     * Renderiza a lista de itens do inventário.
     */
    function render(container, items, onChange) {
        container.innerHTML = '';

        if (!items || items.length === 0) {
            document.getElementById('no-items-msg').style.display = 'block';
            return;
        }

        document.getElementById('no-items-msg').style.display = 'none';

        items.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'inventory-item';
            div.innerHTML = `
                <input type="checkbox" class="item-check" data-index="${index}" ${item.owned ? 'checked' : ''} title="Em posse do personagem">
                <div class="item-fields">
                    <input type="text" class="item-name-input" data-index="${index}" data-item-field="name" value="${escapeHtml(item.name || '')}" placeholder="Nome do item">
                    <input type="text" class="item-desc-input" data-index="${index}" data-item-field="description" value="${escapeHtml(item.description || '')}" placeholder="Descrição do item">
                </div>
                <button class="btn-remove-item" data-index="${index}" title="Remover item">✕</button>
            `;
            container.appendChild(div);
        });

        // Event listeners
        container.querySelectorAll('.item-check').forEach(cb => {
            cb.addEventListener('change', () => onChange());
        });
        container.querySelectorAll('.item-name-input, .item-desc-input').forEach(input => {
            input.addEventListener('input', () => onChange());
        });
        container.querySelectorAll('.btn-remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index);
                items.splice(idx, 1);
                render(container, items, onChange);
                onChange();
            });
        });
    }

    /**
     * Coleta dados de itens do DOM.
     */
    function collectData(container) {
        const items = [];
        const itemDivs = container.querySelectorAll('.inventory-item');
        itemDivs.forEach(div => {
            const check = div.querySelector('.item-check');
            const nameInput = div.querySelector('[data-item-field="name"]');
            const descInput = div.querySelector('[data-item-field="description"]');
            items.push({
                name: nameInput ? nameInput.value : '',
                description: descInput ? descInput.value : '',
                owned: check ? check.checked : false
            });
        });
        return items;
    }

    /**
     * Cria um novo item vazio.
     */
    function createEmptyItem() {
        return { name: '', description: '', owned: true };
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return { render, collectData, createEmptyItem };
})();
