/**
 * CallKeeper — Módulo de Magias
 */

const Magic = (() => {

    /**
     * Renderiza a lista de magias.
     */
    function render(container, spells, onChange) {
        container.innerHTML = '';

        if (!spells || spells.length === 0) {
            document.getElementById('no-spells-msg').style.display = 'block';
            return;
        }

        document.getElementById('no-spells-msg').style.display = 'none';

        spells.forEach((spell, index) => {
            const div = document.createElement('div');
            div.className = 'spell-entry';
            div.innerHTML = `
                <div class="spell-header-row">
                    <h4>Magia #${index + 1}</h4>
                    <button class="btn-remove-spell" data-index="${index}" title="Remover magia">✕ Remover</button>
                </div>
                <div class="spell-grid">
                    <div class="form-group">
                        <label>Nome da Magia</label>
                        <input type="text" data-index="${index}" data-spell-field="name" value="${escapeHtml(spell.name || '')}" placeholder="Nome da magia">
                    </div>
                    <div class="form-group">
                        <label>Custo</label>
                        <div class="cost-group">
                            <input type="text" data-index="${index}" data-spell-field="costValue" value="${escapeHtml(spell.costValue || '')}" placeholder="Valor">
                            <select data-index="${index}" data-spell-field="costType">
                                <option value="PM" ${spell.costType === 'PM' ? 'selected' : ''}>PM</option>
                                <option value="SAN" ${spell.costType === 'SAN' ? 'selected' : ''}>SAN</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Tempo de Conjuração</label>
                        <input type="text" data-index="${index}" data-spell-field="castingTime" value="${escapeHtml(spell.castingTime || '')}" placeholder="Ex: 1 rodada">
                    </div>
                    <div class="form-group full-width">
                        <label>Descrição do Feitiço</label>
                        <textarea data-index="${index}" data-spell-field="description" rows="3" placeholder="Descreva os efeitos da magia...">${escapeHtml(spell.description || '')}</textarea>
                    </div>
                </div>
            `;
            container.appendChild(div);
        });

        // Event listeners
        container.querySelectorAll('input, textarea, select').forEach(el => {
            el.addEventListener('input', () => onChange());
            el.addEventListener('change', () => onChange());
        });
        container.querySelectorAll('.btn-remove-spell').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index);
                spells.splice(idx, 1);
                render(container, spells, onChange);
                onChange();
            });
        });
    }

    /**
     * Coleta dados de magias do DOM.
     */
    function collectData(container) {
        const spells = [];
        const entries = container.querySelectorAll('.spell-entry');
        entries.forEach(entry => {
            const spell = {};
            entry.querySelectorAll('[data-spell-field]').forEach(el => {
                spell[el.dataset.spellField] = el.value;
            });
            spells.push(spell);
        });
        return spells;
    }

    /**
     * Cria uma nova magia vazia.
     */
    function createEmptySpell() {
        return {
            name: '', costValue: '', costType: 'PM',
            castingTime: '', description: ''
        };
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return { render, collectData, createEmptySpell };
})();
