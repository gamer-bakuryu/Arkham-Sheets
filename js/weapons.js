/**
 * CallKeeper — Módulo de Armas
 */

const Weapons = (() => {

    /**
     * Renderiza a lista de armas.
     */
    function render(container, weapons, onChange) {
        container.innerHTML = '';

        if (!weapons || weapons.length === 0) {
            document.getElementById('no-weapons-msg').style.display = 'block';
            return;
        }

        document.getElementById('no-weapons-msg').style.display = 'none';

        weapons.forEach((weapon, index) => {
            const div = document.createElement('div');
            div.className = 'weapon-entry';
            div.innerHTML = `
                <div class="weapon-header-row">
                    <h4>Arma #${index + 1}</h4>
                    <button class="btn-remove-weapon" data-index="${index}" title="Remover arma">✕ Remover</button>
                </div>
                <div class="weapon-grid">
                    <div class="form-group">
                        <label>Nome</label>
                        <input type="text" data-index="${index}" data-weapon-field="name" value="${escapeHtml(weapon.name || '')}" placeholder="Nome da arma">
                    </div>
                    <div class="form-group">
                        <label>Perícia</label>
                        <input type="text" data-index="${index}" data-weapon-field="skill" value="${escapeHtml(weapon.skill || '')}" placeholder="Perícia utilizada">
                    </div>
                    <div class="form-group">
                        <label>Dano</label>
                        <input type="text" data-index="${index}" data-weapon-field="damage" value="${escapeHtml(weapon.damage || '')}" placeholder="Ex: 1D6+2">
                    </div>
                    <div class="form-group">
                        <label>Munição</label>
                        <input type="text" data-index="${index}" data-weapon-field="ammo" value="${escapeHtml(weapon.ammo || '')}" placeholder="Qtd de munição">
                    </div>
                    <div class="form-group">
                        <label>Usos por Rodada</label>
                        <input type="text" data-index="${index}" data-weapon-field="usesPerRound" value="${escapeHtml(weapon.usesPerRound || '')}" placeholder="Ex: 1">
                    </div>
                    <div class="form-group">
                        <label>Alcance</label>
                        <input type="text" data-index="${index}" data-weapon-field="range" value="${escapeHtml(weapon.range || '')}" placeholder="Ex: 50m">
                    </div>
                    <div class="form-group">
                        <label>Defeito</label>
                        <input type="text" data-index="${index}" data-weapon-field="malfunction" value="${escapeHtml(weapon.malfunction || '')}" placeholder="Número de defeito">
                    </div>
                </div>
            `;
            container.appendChild(div);
        });

        // Event listeners
        container.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => onChange());
        });
        container.querySelectorAll('.btn-remove-weapon').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index);
                weapons.splice(idx, 1);
                render(container, weapons, onChange);
                onChange();
            });
        });
    }

    /**
     * Coleta dados de armas do DOM.
     */
    function collectData(container) {
        const weapons = [];
        const entries = container.querySelectorAll('.weapon-entry');
        entries.forEach(entry => {
            const weapon = {};
            entry.querySelectorAll('[data-weapon-field]').forEach(input => {
                weapon[input.dataset.weaponField] = input.value;
            });
            weapons.push(weapon);
        });
        return weapons;
    }

    /**
     * Cria uma nova arma vazia.
     */
    function createEmptyWeapon() {
        return {
            name: '', skill: '', damage: '', ammo: '',
            usesPerRound: '', range: '', malfunction: ''
        };
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return { render, collectData, createEmptyWeapon };
})();
