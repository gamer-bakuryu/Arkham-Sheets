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
            playerName: '',
            characterName: 'Novo Personagem',
            age: '',
            occupation: '',
            portrait: null,
            attributes: {
                for: 0, con: 0, tam: 0, des: 0,
                apa: 0, edu: 0, int: 0, pod: 0, sor: 0
            },
            hpCurrent: 0,
            mpCurrent: 0,
            sanCurrent: 0,
            skills: {},
            inventory: [],
            weapons: [],
            spells: [],
            relations: [],
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
            // Garantir que attributes existe (fichas antigas)
            if (!currentSheet.attributes) {
                currentSheet.attributes = {
                    for: 0, con: 0, tam: 0, des: 0,
                    apa: 0, edu: 0, int: 0, pod: 0, sor: 0
                };
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
            preview.innerHTML = '<img src="' + currentSheet.portrait + '" alt="Retrato">';
            removeBtn.style.display = 'block';
        } else {
            preview.innerHTML = '<span class="portrait-placeholder">512×512</span>';
            removeBtn.style.display = 'none';
        }

        // Atributos — setar valores nos inputs
        const attrs = currentSheet.attributes || {};
        document.querySelectorAll('.attr-value').forEach(function(input) {
            var attrKey = input.dataset.attrField;
            var val = (attrs[attrKey] !== undefined && attrs[attrKey] !== null) ? attrs[attrKey] : 0;
            input.value = val;
        });

        // Status editáveis
        setVal('hp-current', currentSheet.hpCurrent || 0);
        setVal('mp-current', currentSheet.mpCurrent || 0);
        setVal('san-current', currentSheet.sanCurrent || 0);

        // Calcular e atualizar todos os campos derivados
        updateAllCalculations();

        // Perícias
        var skillsContainer = document.getElementById('skills-list');
        Skills.render(skillsContainer, currentSheet, getCurrentAttributes());

        // Inventário
        var invContainer = document.getElementById('inventory-list');
        Inventory.render(invContainer, currentSheet.inventory || [], scheduleAutoSave);

        // Armas
        var weaponsContainer = document.getElementById('weapons-list');
        Weapons.render(weaponsContainer, currentSheet.weapons || [], scheduleAutoSave);

        // Magias
        var magicContainer = document.getElementById('magic-list');
        Magic.render(magicContainer, currentSheet.spells || [], scheduleAutoSave);

        // Relações
        var relContainer = document.getElementById('relations-list');
        Relations.render(relContainer, currentSheet.relations || [], scheduleAutoSave);

        // Informações pessoais
        var personalFields = [
            'personalDescription', 'ideology', 'traits', 'injuries',
            'phobias', 'treasures', 'encounters', 'backstory', 'notes'
        ];
        personalFields.forEach(function(field) {
            var el = document.querySelector('[data-field="' + field + '"]');
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
        if (!currentSheet.attributes) {
            currentSheet.attributes = {};
        }
        document.querySelectorAll('.attr-value').forEach(function(input) {
            var attrKey = input.dataset.attrField;
            currentSheet.attributes[attrKey] = parseInt(input.value) || 0;
        });

        // Status editáveis
        currentSheet.hpCurrent = parseInt(getVal('hp-current')) || 0;
        currentSheet.mpCurrent = parseInt(getVal('mp-current')) || 0;
        currentSheet.sanCurrent = parseInt(getVal('san-current')) || 0;

        // Perícias
        var skillsContainer = document.getElementById('skills-list');
        currentSheet.skills = Skills.collectValues(skillsContainer);

        // Inventário
        var invContainer = document.getElementById('inventory-list');
        currentSheet.inventory = Inventory.collectData(invContainer);

        // Armas
        var weaponsContainer = document.getElementById('weapons-list');
        currentSheet.weapons = Weapons.collectData(weaponsContainer);

        // Magias
        var magicContainer = document.getElementById('magic-list');
        currentSheet.spells = Magic.collectData(magicContainer);

        // Relações
        var relContainer = document.getElementById('relations-list');
        currentSheet.relations = Relations.collectData(relContainer);

        // Informações pessoais
        var personalFields = [
            'personalDescription', 'ideology', 'traits', 'injuries',
            'phobias', 'treasures', 'encounters', 'backstory', 'notes'
        ];
        personalFields.forEach(function(field) {
            var el = document.querySelector('[data-field="' + field + '"]');
            if (el) currentSheet[field] = el.value;
        });

        currentSheet.updatedAt = new Date().toISOString();
        Storage.saveSheet(currentSheet);
    }

    /**
     * Atualiza todos os campos calculados automaticamente.
     */
    function updateAllCalculations() {
        // Ler atributos diretamente dos inputs do DOM
        var forVal = parseInt(document.querySelector('[data-attr-field="for"]').value) || 0;
        var conVal = parseInt(document.querySelector('[data-attr-field="con"]').value) || 0;
        var tamVal = parseInt(document.querySelector('[data-attr-field="tam"]').value) || 0;
        var desVal = parseInt(document.querySelector('[data-attr-field="des"]').value) || 0;
        var apaVal = parseInt(document.querySelector('[data-attr-field="apa"]').value) || 0;
        var eduVal = parseInt(document.querySelector('[data-attr-field="edu"]').value) || 0;
        var intVal = parseInt(document.querySelector('[data-attr-field="int"]').value) || 0;
        var podVal = parseInt(document.querySelector('[data-attr-field="pod"]').value) || 0;
        var sorVal = parseInt(document.querySelector('[data-attr-field="sor"]').value) || 0;

        // Metade e quinto dos atributos
        document.querySelectorAll('.attr-row').forEach(function(row) {
            var input = row.querySelector('.attr-value');
            var val = parseInt(input.value) || 0;
            var halfEl = row.querySelector('.attr-half');
            var fifthEl = row.querySelector('.attr-fifth');
            if (halfEl) halfEl.textContent = Calculations.half(val);
            if (fifthEl) fifthEl.textContent = Calculations.fifth(val);
        });

        // PV Máximo = (CON + TAM) / 5 arredondado para baixo
        var maxHP = Calculations.calcMaxHP(conVal, tamVal);
        var hpMaxEl = document.getElementById('hp-max');
        if (hpMaxEl) hpMaxEl.textContent = maxHP;

        // PM Máximo = POD / 5 arredondado para baixo
        var maxMP = Calculations.calcMaxMP(podVal);
        var mpMaxEl = document.getElementById('mp-max');
        if (mpMaxEl) mpMaxEl.textContent = maxMP;

        // Sanidade Máxima = POD
        var sanMaxEl = document.getElementById('san-max');
        if (sanMaxEl) sanMaxEl.textContent = podVal;

        // Movimento
        var mov = Calculations.calcMOV(forVal, desVal, tamVal);
        var movEl = document.getElementById('mov-value');
        if (movEl) movEl.textContent = mov;

        // Dano Extra e Corpo
        var result = Calculations.calcDamageBonusAndBuild(forVal, tamVal);
        var dmgEl = document.getElementById('dmg-bonus');
        if (dmgEl) dmgEl.textContent = result.damageBonus;
        var buildEl = document.getElementById('build-value');
        if (buildEl) buildEl.textContent = result.build;
    }

    /**
     * Obtém os atributos atuais do DOM.
     */
    function getCurrentAttributes() {
        var attrs = {};
        document.querySelectorAll('.attr-value').forEach(function(input) {
            attrs[input.dataset.attrField] = parseInt(input.value) || 0;
        });
        return attrs;
    }

    /**
     * Agenda auto-save com debounce.
     */
    function scheduleAutoSave() {
        if (autoSaveTimer) clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(function() {
            collectAndSave();
        }, 500);
    }

    /**
     * Inicializa os event listeners do editor.
     */
    function initEditorEvents() {
        // Informações básicas - auto save
        document.querySelectorAll('#tab-main .info-section input').forEach(function(input) {
            input.addEventListener('input', scheduleAutoSave);
        });

        // Atributos - auto save + recalcular
        document.querySelectorAll('.attr-value').forEach(function(input) {
            input.addEventListener('input', function() {
                updateAllCalculations();

                // Atualizar Esquivar e Língua Nativa nas perícias se a aba estiver carregada
                var attrs = getCurrentAttributes();
                var skillsContainer = document.getElementById('skills-list');
                if (skillsContainer.children.length > 0) {
                    // Salvar valores atuais das perícias antes de re-renderizar
                    var currentSkillValues = Skills.collectValues(skillsContainer);
                    if (currentSheet) {
                        currentSheet.skills = currentSkillValues;
                    }
                    Skills.render(skillsContainer, currentSheet || {}, attrs);
                }

                scheduleAutoSave();
            });
        });

        // Status editáveis - auto save
        ['hp-current', 'mp-current', 'san-current'].forEach(function(id) {
            var el = document.getElementById(id);
            if (el) el.addEventListener('input', scheduleAutoSave);
        });

        // Upload de retrato
        document.getElementById('portrait-upload').addEventListener('change', handlePortraitUpload);
        document.getElementById('btn-remove-portrait').addEventListener('click', removePortrait);

        // Perícias - delegação de eventos
        document.getElementById('skills-list').addEventListener('input', function(e) {
            if (e.target.classList.contains('skill-value')) {
                var row = e.target.closest('.skill-row');
                var val = parseInt(e.target.value) || 0;
                Skills.updateCalculations(row, val);
                scheduleAutoSave();
            }
        });

        // Botões de adicionar
        document.getElementById('btn-add-item').addEventListener('click', function() {
            if (!currentSheet.inventory) currentSheet.inventory = [];
            currentSheet.inventory.push(Inventory.createEmptyItem());
            Inventory.render(
                document.getElementById('inventory-list'),
                currentSheet.inventory,
                scheduleAutoSave
            );
            scheduleAutoSave();
        });

        document.getElementById('btn-add-weapon').addEventListener('click', function() {
            if (!currentSheet.weapons) currentSheet.weapons = [];
            currentSheet.weapons.push(Weapons.createEmptyWeapon());
            Weapons.render(
                document.getElementById('weapons-list'),
                currentSheet.weapons,
                scheduleAutoSave
            );
            scheduleAutoSave();
        });

        document.getElementById('btn-add-spell').addEventListener('click', function() {
            if (!currentSheet.spells) currentSheet.spells = [];
            currentSheet.spells.push(Magic.createEmptySpell());
            Magic.render(
                document.getElementById('magic-list'),
                currentSheet.spells,
                scheduleAutoSave
            );
            scheduleAutoSave();
        });

        document.getElementById('btn-add-relation').addEventListener('click', function() {
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
        document.querySelectorAll('#tab-relations textarea').forEach(function(ta) {
            ta.addEventListener('input', scheduleAutoSave);
        });

        // Exportar ficha individual
        document.getElementById('btn-export-sheet').addEventListener('click', function() {
            collectAndSave();
            var json = Storage.exportSingleSheet(currentSheet.id);
            if (json) {
                downloadJSON(json, 'callkeeper_' + (currentSheet.characterName || 'ficha').replace(/\s+/g, '_') + '.json');
            }
        });

        // Excluir ficha
        document.getElementById('btn-delete-sheet').addEventListener('click', function() {
            if (confirm('Tem certeza que deseja excluir a ficha "' + currentSheet.characterName + '"?')) {
                Storage.deleteSheet(currentSheet.id);
                currentSheet = null;
                App.showScreen('sheets');
            }
        });

        // Voltar para lista
        document.getElementById('btn-back-to-list').addEventListener('click', function() {
            collectAndSave();
            currentSheet = null;
            App.showScreen('sheets');
        });
    }

    /**
     * Gerencia upload de retrato.
     */
    function handlePortraitUpload(e) {
        var file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione um arquivo de imagem.');
            return;
        }

        var reader = new FileReader();
        reader.onload = function(evt) {
            var img = new Image();
            img.onload = function() {
                var canvas = document.createElement('canvas');
                canvas.width = 512;
                canvas.height = 512;
                var ctx = canvas.getContext('2d');

                // Crop centralizado
                var size = Math.min(img.width, img.height);
                var sx = (img.width - size) / 2;
                var sy = (img.height - size) / 2;
                ctx.drawImage(img, sx, sy, size, size, 0, 0, 512, 512);

                var dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                currentSheet.portrait = dataUrl;

                var preview = document.getElementById('portrait-preview');
                preview.innerHTML = '<img src="' + dataUrl + '" alt="Retrato">';
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
        var preview = document.getElementById('portrait-preview');
        preview.innerHTML = '<span class="portrait-placeholder">512×512</span>';
        document.getElementById('btn-remove-portrait').style.display = 'none';
        scheduleAutoSave();
    }

    // Helpers
    function setVal(id, value) {
        var el = document.getElementById(id);
        if (el) el.value = (value !== undefined && value !== null) ? value : '';
    }

    function getVal(id) {
        var el = document.getElementById(id);
        return el ? el.value : '';
    }

    function downloadJSON(content, filename) {
        var blob = new Blob([content], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    return {
        createNewSheet: createNewSheet,
        openSheet: openSheet,
        collectAndSave: collectAndSave,
        initEditorEvents: initEditorEvents,
        getCurrentSheet: function() { return currentSheet; }
    };
})();
