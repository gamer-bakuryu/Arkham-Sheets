/**
 * CallKeeper — Módulo de Relações Interpessoais
 */

const Relations = (() => {

    /**
     * Renderiza a lista de relações.
     */
    function render(container, relations, onChange) {
        container.innerHTML = '';

        if (!relations || relations.length === 0) {
            document.getElementById('no-relations-msg').style.display = 'block';
            return;
        }

        document.getElementById('no-relations-msg').style.display = 'none';

        relations.forEach((relation, index) => {
            const div = document.createElement('div');
            div.className = 'relation-entry';
            div.innerHTML = `
                <div class="form-group">
                    <label>Nome</label>
                    <input type="text" data-index="${index}" data-relation-field="name" value="${escapeHtml(relation.name || '')}" placeholder="Nome da pessoa">
                </div>
                <div class="form-group">
                    <label>Relação / Descrição</label>
                    <input type="text" data-index="${index}" data-relation-field="description" value="${escapeHtml(relation.description || '')}" placeholder="Tipo de relação ou descrição">
                </div>
                <button class="btn-remove-relation" data-index="${index}" title="Remover relação">✕</button>
            `;
            container.appendChild(div);
        });

        // Event listeners
        container.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => onChange());
        });
        container.querySelectorAll('.btn-remove-relation').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index);
                relations.splice(idx, 1);
                render(container, relations, onChange);
                onChange();
            });
        });
    }

    /**
     * Coleta dados de relações do DOM.
     */
    function collectData(container) {
        const relations = [];
        const entries = container.querySelectorAll('.relation-entry');
        entries.forEach(entry => {
            const relation = {};
            entry.querySelectorAll('[data-relation-field]').forEach(input => {
                relation[input.dataset.relationField] = input.value;
            });
            relations.push(relation);
        });
        return relations;
    }

    /**
     * Cria uma nova relação vazia.
     */
    function createEmptyRelation() {
        return { name: '', description: '' };
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return { render, collectData, createEmptyRelation };
})();
