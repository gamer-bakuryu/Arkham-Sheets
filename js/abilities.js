/**
 * CallKeeper — Módulo de Habilidades (Pulp)
 */

var Abilities = (function() {

    /**
     * Renderiza a lista de habilidades.
     */
    function render(container, abilities, onChange) {
        container.innerHTML = '';

        if (!abilities || abilities.length === 0) {
            document.getElementById('no-abilities-msg').style.display = 'block';
            return;
        }

        document.getElementById('no-abilities-msg').style.display = 'none';

        abilities.forEach(function(ability, index) {
            var div = document.createElement('div');
            div.className = 'ability-entry';
            div.innerHTML =
                '<div class="ability-header-row">' +
                    '<h4>Habilidade #' + (index + 1) + '</h4>' +
                    '<button class="btn-remove-ability" data-index="' + index + '" title="Remover habilidade">✕ Remover</button>' +
                '</div>' +
                '<div class="ability-grid">' +
                    '<div class="form-group">' +
                        '<label>Nome da Habilidade</label>' +
                        '<input type="text" data-index="' + index + '" data-ability-field="name" value="' + escapeHtml(ability.name || '') + '" placeholder="Nome da habilidade">' +
                    '</div>' +
                    '<div class="form-group">' +
                        '<label>Descrição</label>' +
                        '<textarea data-index="' + index + '" data-ability-field="description" rows="3" placeholder="Descreva o efeito da habilidade...">' + escapeHtml(ability.description || '') + '</textarea>' +
                    '</div>' +
                '</div>';
            container.appendChild(div);
        });

        // Event listeners
        container.querySelectorAll('input, textarea').forEach(function(el) {
            el.addEventListener('input', function() { onChange(); });
        });
        container.querySelectorAll('.btn-remove-ability').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                var idx = parseInt(e.target.dataset.index);
                abilities.splice(idx, 1);
                render(container, abilities, onChange);
                onChange();
            });
        });
    }

    /**
     * Coleta dados de habilidades do DOM.
     */
    function collectData(container) {
        var abilities = [];
        var entries = container.querySelectorAll('.ability-entry');
        entries.forEach(function(entry) {
            var ability = {};
            entry.querySelectorAll('[data-ability-field]').forEach(function(el) {
                ability[el.dataset.abilityField] = el.value;
            });
            abilities.push(ability);
        });
        return abilities;
    }

    /**
     * Cria uma nova habilidade vazia.
     */
    function createEmptyAbility() {
        return { name: '', description: '' };
    }

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return { render: render, collectData: collectData, createEmptyAbility: createEmptyAbility };
})();
