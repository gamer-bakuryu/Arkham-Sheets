/**
 * CallKeeper — Módulo de Perícias
 * Todas as perícias do Chamado de Cthulhu 7ª Edição.
 */

const Skills = (() => {

    /**
     * Lista completa de perícias.
     * baseValue pode ser um número fixo ou uma string indicando cálculo dinâmico.
     */
    const SKILL_LIST = [
        { name: 'Antropologia', base: 1 },
        { name: 'Arcos', base: 15 },
        { name: 'Armas Pesadas', base: 10 },
        { name: 'Arqueologia', base: 1 },
        { name: 'Arremessar', base: 20 },
        { name: 'Astronomia', base: 1 },
        { name: 'Atuação', base: 5 },
        { name: 'Avaliação', base: 5 },
        { name: 'Belas Artes', base: 5 },
        { name: 'Biologia', base: 1 },
        { name: 'Botânica', base: 1 },
        { name: 'Briga', base: 25 },
        { name: 'Cavalgar', base: 5 },
        { name: 'Charme', base: 15 },
        { name: 'Chaveiro', base: 1 },
        { name: 'Chicotes', base: 5 },
        { name: 'Ciência Forense', base: 1 },
        { name: 'Consertos Elétricos', base: 10 },
        { name: 'Consertos Mecânicos', base: 10 },
        { name: 'Contabilidade', base: 5 },
        { name: 'Criptografia', base: 1 },
        { name: 'Direito', base: 5 },
        { name: 'Dirigir Automóveis', base: 20 },
        { name: 'Disfarce', base: 5 },
        { name: 'Eletrônica', base: 1 },
        { name: 'Encontrar', base: 25 },
        { name: 'Engenharia', base: 1 },
        { name: 'Escalar', base: 20 },
        { name: 'Espingardas', base: 25 },
        { name: 'Escutar', base: 20 },
        { name: 'Espadas', base: 20 },
        { name: 'Esquivar', base: 'DES/2' },
        { name: 'Falsificação', base: 5 },
        { name: 'Farmácia', base: 1 },
        { name: 'Física', base: 1 },
        { name: 'Fotografia', base: 5 },
        { name: 'Furtividade', base: 20 },
        { name: 'Garrote', base: 15 },
        { name: 'Geologia', base: 1 },
        { name: 'História', base: 5 },
        { name: 'Intimidação', base: 15 },
        { name: 'Lábia', base: 5 },
        { name: 'Lança-Chamas', base: 10 },
        { name: 'Lanças', base: 20 },
        { name: 'Língua (Nativa)', base: 'EDU' },
        { name: 'Língua (Outra)', base: 1 },
        { name: 'Machados', base: 15 },
        { name: 'Manguais', base: 10 },
        { name: 'Matemática', base: 1 },
        { name: 'Medicina', base: 1 },
        { name: 'Mergulho', base: 1 },
        { name: 'Meteorologia', base: 1 },
        { name: 'Metralhadoras', base: 10 },
        { name: 'Motosserras', base: 10 },
        { name: 'Mundo Natural', base: 10 },
        { name: 'Mythos de Cthulhu', base: 0 },
        { name: 'Natação', base: 20 },
        { name: 'Navegação', base: 10 },
        { name: 'Nível de Crédito', base: 0 },
        { name: 'Ocultismo', base: 5 },
        { name: 'Operar Maquinário Pesado', base: 1 },
        { name: 'Persuasão', base: 10 },
        { name: 'Pilotar', base: 1 },
        { name: 'Pistolas', base: 20 },
        { name: 'Prestidigitação', base: 10 },
        { name: 'Primeiros Socorros', base: 30 },
        { name: 'Psicanálise', base: 1 },
        { name: 'Psicologia', base: 10 },
        { name: 'Química', base: 1 },
        { name: 'Rastrear', base: 10 },
        { name: 'Rifles', base: 25 },
        { name: 'Saltar', base: 20 },
        { name: 'Sobrevivência', base: 10 },
        { name: 'Submetralhadoras', base: 15 },
        { name: 'Usar Bibliotecas', base: 20 },
        { name: 'Usar Computadores', base: 5 },
        { name: 'Zoologia', base: 1 }
    ];

    /**
     * Retorna a lista de perícias com seus valores base.
     */
    function getSkillList() {
        return SKILL_LIST;
    }

    /**
     * Resolve o valor base de uma perícia (pode depender de atributos).
     */
    function resolveBaseValue(skill, attributes) {
        if (typeof skill.base === 'number') {
            return skill.base;
        }
        if (skill.base === 'DES/2') {
            return Calculations.calcDodgeBase(attributes.des || 0);
        }
        if (skill.base === 'EDU') {
            return attributes.edu || 0;
        }
        return 0;
    }

    /**
     * Formata o texto de exibição do valor base.
     */
    function formatBase(skill) {
        if (typeof skill.base === 'number') {
            return skill.base + '%';
        }
        if (skill.base === 'DES/2') {
            return 'metade da DES';
        }
        if (skill.base === 'EDU') {
            return 'EDU';
        }
        return skill.base;
    }

    /**
     * Renderiza a lista de perícias no DOM.
     */
    function render(container, sheetData, attributes) {
        container.innerHTML = '';

        SKILL_LIST.forEach((skill, index) => {
            const baseVal = resolveBaseValue(skill, attributes);
            const savedValue = (sheetData.skills && sheetData.skills[index] !== undefined)
                ? sheetData.skills[index]
                : null;
            const currentValue = savedValue !== null ? savedValue : baseVal;
            const halfVal = Calculations.half(currentValue);
            const fifthVal = Calculations.fifth(currentValue);

            const row = document.createElement('div');
            row.className = 'skill-row';
            row.innerHTML = `
                <span class="skill-name">${skill.name} <span class="skill-base">(${formatBase(skill)})</span></span>
                <input type="number" class="skill-value" data-skill-index="${index}" value="${currentValue}" min="0" max="999">
                <span class="skill-half">${halfVal}</span>
                <span class="skill-fifth">${fifthVal}</span>
            `;

            container.appendChild(row);
        });
    }

    /**
     * Coleta todos os valores de perícias do DOM.
     */
    function collectValues(container) {
        const values = {};
        const inputs = container.querySelectorAll('.skill-value');
        inputs.forEach(input => {
            const index = input.dataset.skillIndex;
            values[index] = parseInt(input.value) || 0;
        });
        return values;
    }

    /**
     * Atualiza metade e quinto de uma perícia específica.
     */
    function updateCalculations(row, value) {
        const halfEl = row.querySelector('.skill-half');
        const fifthEl = row.querySelector('.skill-fifth');
        if (halfEl) halfEl.textContent = Calculations.half(value);
        if (fifthEl) fifthEl.textContent = Calculations.fifth(value);
    }

    return {
        getSkillList,
        resolveBaseValue,
        formatBase,
        render,
        collectValues,
        updateCalculations
    };
})();
