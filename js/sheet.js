/**
 * CallKeeper — Módulo de Ficha (Editor)
 * Gerencia a edição de uma ficha individual.
 */

const SheetEditor = (() => {
    let currentSheet = null;
    let autoSaveTimer = null;

    /**
     * Cria uma ficha nova com valores padrão.
     */
    function createNewSheet() {
        return {
            id: Storage.generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            // Informações básicas
            playerName: '',
            characterName: 'Novo Personagem',
            age: '',
            occupation: '',
            portrait: null,
            // Atributos
            attributes: {
                for: 0, con: 0, tam: 0, des: 0,
                apa: 0, edu: 0, int: 0, pod: 0, sor: 0
            },
            // Status
            hpCurrent: 0,
            mpCurrent: 0,
            sanCurrent: 0,
            // Perícias
            skills: {},
            // Inventário
            inventory: [],
            // Armas
            weapons: [],
            // Magias
            spells: [],
            // Relações
            relations: [],
            // Informações pessoais
            personalDescription: '',
            ideology: '',
            traits: '',
            injuries: '',
            phobias: '',
            treasures: '',
            encounters: '',
            backstory: '',
            notes: ''
        };
    }

    /**
     * Abre uma ficha para edição.
     */
    function openSheet(sheetId) {
        if (sheetId) {
            currentSheet = Storage.getSheetById(sheetId);
            if (!currentSheet) {
                alert('Ficha não encontrada.');
                return;
            }
        } else {
            currentSheet = createNewSheet();
            Storage.saveSheet(currentSheet);
        }

        populateEditor();
        App.showScreen('editor');
    }

    /**
     * Popula todos os campos do editor com dados da ficha.
     */
    function populateEditor() {
        if (!currentSheet) return;

        // Informações básicas
        setVal('char-player', currentSheet.playerName);
        setVal('char-name', currentSheet.characterName);
        setVal('char-age', currentSheet.age);
        setVal('char-occupation', currentSheet.occupation);

        // Retrato
        const preview = document.getElementById('portrait-preview');
        const removeBtn = document.getElementById('btn-remove-portrait');
        if (currentSheet.portrait) {
            preview.innerHTML = `<img src="${currentSheet.portrait}" alt="Retrato">`;
            removeBtn.style.display = 'block';
        } else {
            preview.innerHTML = '<span class="portrait-placeholder">512×512</span>';
            removeBtn.style.display = 'none';
        }

        // Atributos
        const attrs = currentSheet.attributes || {};
        document.querySelectorAll('.attr-value').forEach(input => {
            const attrKey = input.dataset.attrField;
            input.value = attrs[attrKey] || 0;
        });

        // Status editáveis
        setVal('hp-current', currentSheet.hpCurrent || 0);
        setVal('mp-current', currentSheet.mpCurrent || 0);
        setVal('san-current', currentSheet.sanCurrent || 0);

        // Calcular e atualizar todos os campos derivados
        updateAllCalculations();

        // Perícias
        const skillsContainer = document.getElementById('skills-list');
        Skills.render(skillsContainer, currentSheet, attrs);

        // Inventário
        const invContainer = document.getElementById('inventory-list');
        Inventory.render(invContainer, currentSheet.inventory || [], scheduleAutoSave);

        // Armas
        const weaponsContainer = document.getElementById('weapons-list');
        Weapons.render(weaponsContainer, currentSheet.weapons || [], scheduleAutoSave);

        // Magias
        const magicContainer = document.getElementById('magic-list');
        Magic.render(magicContainer, currentSheet.spells || [], scheduleAutoSave);

        // Relações
        const relContainer = document.getElementById('relations-list');
        Relations.render(relContainer, currentSheet.relations || [], scheduleAutoSave);

        // Informações pessoais
        const personalFields = [
            'personalDescription', 'ideology', 'traits', 'injuries',
            'phobias', 'treasures', 'encounters', 'backstory', 'notes'
        ];
        personalFields.forEach(field => {
            const el = document.querySelector(`[data-field="${field}"]`);
            if (el) el.value = currentSheet[field] || '';
        });
    }

    /**
     * Coleta todos os dados do editor e salva na ficha.
     */
    function collectAndSave() {
        if (!currentSheet) return;

        // Informações básicas
        currentSheet.playerName = getVal('char-player');
        currentSheet.characterName = getVal('char-name') || 'Sem Nome';
        currentSheet.age = getVal('char-age');
        currentSheet.occupation = getVal('char-occupation');

        // Atributos
        document.querySelectorAll('.attr-value').forEach(input => {
            const attrKey = input.dataset.attrField;
            currentSheet.attributes[attrKey] = parseInt(input.value) || 0;
        });

        // Status editáveis
        currentSheet.hpCurrent = parseInt(getVal('hp-current')) || 0;
        currentSheet.mpCurrent = parseInt(getVal('mp-current')) || 0;
        currentSheet.sanCurrent = parseInt(getVal('san-current')) || 0;

        // Perícias
        const skillsContainer = document.getElementById('skills-list');
        currentSheet.skills = Skills.collectValues(skillsContainer);

        // Inventário
        const invContainer = document.getElementById('inventory-list');
        currentSheet.inventory = Inventory.collectData(invContainer);

        // Armas
        const weaponsContainer = document.getElementById('weapons-list');
        currentSheet.weapons = Weapons.collectData(weaponsContainer);

        // Magias
        const magicContainer = document.getElementById('magic-list');
        currentSheet.spells = Magic.collectData(magicContainer);

        // Relações
        const relContainer = document.getElementById('relations-list');
        currentSheet.relations = Relations.collectData(relContainer);

        // Informações pessoais
        const personalFields = [
            'personalDescription', 'ideology', 'traits', 'injuries',
            'phobias', 'treasures', 'encounters', 'backstory', 'notes'
        ];
        personalFields.forEach(field => {
            const el = document.querySelector(`[data-field="${field}"]`);
            if (el) currentSheet[field] = el.value;
        });

        currentSheet.updatedAt = new Date().toISOString();
        Storage.saveSheet(currentSheet);
    }

    /**
     * Atualiza todos os campos calculados automaticamente.
     */
    function updateAllCalculations() {
        const attrs = getCurrentAttributes();

        // Metade e quinto dos atributos
        document.querySelectorAll('.attr-row').forEach(row => {
            const input = row.querySelector('.attr-value');
            const val = parseInt(input.value) || 0;
            const halfEl = row.querySelector('.attr-half');
            const fifthEl = row.querySelector('.attr-fifth');
            if (halfEl) halfEl.textContent = Calculations.half(val);
            if (fifthEl) fifthEl.textContent = Calculations.fifth(val);
        });

        // PV Máximo
        const maxHP = Calculations.calcMaxHP(attrs.con, attrs.tam);
        document.getElementById('hp-max').textContent = maxHP;

        // PM Máximo
        const maxMP = Calculations.calcMaxMP(attrs.pod);
        document.getElementById('mp-max').textContent = maxMP;

        // Movimento
        const mov = Calculations.calcMOV(attrs.for, attrs.des, attrs.tam);
        document.getElementById('mov-value').textContent = mov;

        // Dano Extra e Corpo
        const { damageBonus, build } = Calculations.calcDamageBonusAndBuild(attrs.for, attrs.tam);
        document.getElementById('dmg-bonus').textContent = damageBonus;
        document.getElementById('build-value').textContent = build;
    }

    /**
     * Obtém os atributos atuais do DOM.
     */
    function getCurrentAttributes() {
        const attrs = {};
        document.querySelectorAll('.attr-value').forEach(input => {
            attrs[input.dataset.attrField] = parseInt(input.value) || 0;
        });
        return attrs;
    }

    /**
     * Agenda auto-save com debounce.
     */
    function scheduleAutoSave() {
        if (autoSaveTimer) clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(() => {
            collectAndSave();
        }, 500);
    }

    /**
     * Inicializa os event listeners do editor.
     */
    function initEditorEvents() {
        // Informações básicas - auto save
        document.querySelectorAll('#tab-main .info-section input').forEach(input => {
            input.addEventListener('input', scheduleAutoSave);
        });

        // Atributos - auto save + recalcular
        document.querySelectorAll('.attr-value').forEach(input => {
            input.addEventListener('input', () => {
                updateAllCalculations();

                // Atualizar Esquivar e Língua Nativa nas perícias se a aba estiver carregada
                const attrs = getCurrentAttributes();
                const skillsContainer = document.getElementById('skills-list');
                if (skillsContainer.children.length > 0) {
                    Skills.render(skillsContainer, currentSheet || {}, attrs);
                    // Re-adicionar listeners de perícias
                    skillsContainer.querySelectorAll('.skill-value').forEach(skillInput => {
                        skillInput.addEventListener('input', (e) => {
                            const row = e.target.closest('.skill-row');
                            const val = parseInt(e.target.value) || 0;
                            Skills.updateCalculations(row, val);
                            scheduleAutoSave();
                        });
                    });
                }

                scheduleAutoSave();
            });
        });

        // Status editáveis - auto save
        ['hp-current', 'mp-current', 'san-current'].forEach(id => {
            document.getElementById(id).addEventListener('input', scheduleAutoSave);
        });

        // Upload de retrato
        document.getElementById('portrait-upload').addEventListener('change', handlePortraitUpload);
        document.getElementById('btn-remove-portrait').addEventListener('click', removePortrait);

        // Perícias - delegação de eventos
        document.getElementById('skills-list').addEventListener('input', (e) => {
            if (e.target.classList.contains('skill-value')) {
                const row = e.target.closest('.skill-row');
                const val = parseInt(e.target.value) || 0;
                Skills.updateCalculations(row, val);
                scheduleAutoSave();
            }
        });

        // Botões de adicionar
        document.getElementById('btn-add-item').addEventListener('click', () => {
            if (!currentSheet.inventory) currentSheet.inventory = [];
            currentSheet.inventory.push(Inventory.createEmptyItem());
            Inventory.render(
                document.getElementById('inventory-list'),
                currentSheet.inventory,
                scheduleAutoSave
            );
            scheduleAutoSave();
        });

        document.getElementById('btn-add-weapon').addEventListener('click', () => {
            if (!currentSheet.weapons) currentSheet.weapons = [];
            currentSheet.weapons.push(Weapons.createEmptyWeapon());
            Weapons.render(
                document.getElementById('weapons-list'),
                currentSheet.weapons,
                scheduleAutoSave
            );
            scheduleAutoSave();
        });

        document.getElementById('btn-add-spell').addEventListener('click', () => {
            if (!currentSheet.spells) currentSheet.spells = [];
            currentSheet.spells.push(Magic.createEmptySpell());
            Magic.render(
                document.getElementById('magic-list'),
                currentSheet.spells,
                scheduleAutoSave
            );
            scheduleAutoSave();
        });

        document.getElementById('btn-add-relation').addEventListener('click', () => {
            if (!currentSheet.relations) currentSheet.relations = [];
            currentSheet.relations.push(Relations.createEmptyRelation());
            Relations.render(
                document.getElementById('relations-list'),
                currentSheet.relations,
                scheduleAutoSave
            );
            scheduleAutoSave();
        });

        // Informações pessoais - auto save
        document.querySelectorAll('#tab-relations textarea').forEach(ta => {
            ta.addEventListener('input', scheduleAutoSave);
        });

        // Exportar ficha individual
        document.getElementById('btn-export-sheet').addEventListener('click', () => {
            collectAndSave();
            const json = Storage.exportSingleSheet(currentSheet.id);
            if (json) {
                downloadJSON(json, `callkeeper_${(currentSheet.characterName || 'ficha').replace(/\s+/g, '_')}.json`);
            }
        });

        // Excluir ficha
        document.getElementById('btn-delete-sheet').addEventListener('click', () => {
            if (confirm(`Tem certeza que deseja excluir a ficha "${currentSheet.characterName}"?`)) {
                Storage.deleteSheet(currentSheet.id);
                currentSheet = null;
                App.showScreen('sheets');
            }
        });

        // Voltar para lista
        document.getElementById('btn-back-to-list').addEventListener('click', () => {
            collectAndSave();
            currentSheet = null;
            App.showScreen('sheets');
        });
    }

    /**
     * Gerencia upload de retrato.
     */
    function handlePortraitUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione um arquivo de imagem.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (evt) => {
            // Redimensionar para 512x512
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = 512;
                canvas.height = 512;
                const ctx = canvas.getContext('2d');

                // Crop centralizado
                const size = Math.min(img.width, img.height);
                const sx = (img.width - size) / 2;
                const sy = (img.height - size) / 2;
                ctx.drawImage(img, sx, sy, size, size, 0, 0, 512, 512);

                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                currentSheet.portrait = dataUrl;

                const preview = document.getElementById('portrait-preview');
                preview.innerHTML = `<img src="${dataUrl}" alt="Retrato">`;
                document.getElementById('btn-remove-portrait').style.display = 'block';

                scheduleAutoSave();
            };
            img.src = evt.target.result;
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    }

    /**
     * Remove o retrato.
     */
    function removePortrait() {
        currentSheet.portrait = null;
        const preview = document.getElementById('portrait-preview');
        preview.innerHTML = '<span class="portrait-placeholder">512×512</span>';
        document.getElementById('btn-remove-portrait').style.display = 'none';
        scheduleAutoSave();
    }

    // Helpers
    function setVal(id, value) {
        const el = document.getElementById(id);
        if (el) el.value = value || '';
    }

    function getVal(id) {
        const el = document.getElementById(id);
        return el ? el.value : '';
    }

    function downloadJSON(content, filename) {
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    return {
        createNewSheet,
        openSheet,
        collectAndSave,
        initEditorEvents,
        getCurrentSheet: () => currentSheet
    };
})();
