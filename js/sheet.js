/**
 * CallKeeper — Módulo de Ficha (Editor)
 */

var SheetEditor = (function() {
    var currentSheet = null;
    var autoSaveTimer = null;

    function createNewSheet(sheetType) {
        return {
            id: Storage.generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            sheetType: sheetType || 'normal',
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
            majorWound: false,
            unconscious: false,
            tempInsanity: false,
            indefInsanity: false,
            skills: {},
            inventory: [],
            weapons: [],
            spells: [],
            abilities: [],
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

    function openSheet(sheetId, sheetType) {
        if (sheetId) {
            currentSheet = Storage.getSheetById(sheetId);
            if (!currentSheet) {
                alert('Ficha não encontrada.');
                return;
            }
            if (!currentSheet.attributes) {
                currentSheet.attributes = {
                    for: 0, con: 0, tam: 0, des: 0,
                    apa: 0, edu: 0, int: 0, pod: 0, sor: 0
                };
            }
            if (!currentSheet.sheetType) currentSheet.sheetType = 'normal';
            if (!currentSheet.abilities) currentSheet.abilities = [];
            // Compatibilidade com fichas antigas
            if (currentSheet.majorWound === undefined) currentSheet.majorWound = false;
            if (currentSheet.unconscious === undefined) currentSheet.unconscious = false;
            if (currentSheet.tempInsanity === undefined) currentSheet.tempInsanity = false;
            if (currentSheet.indefInsanity === undefined) currentSheet.indefInsanity = false;
        } else {
            currentSheet = createNewSheet(sheetType || 'normal');
            Storage.saveSheet(currentSheet);
        }

        configurePulpTab();
        populateEditor();
        App.showScreen('editor');
    }

    function configurePulpTab() {
        var abilitiesTab = document.getElementById('tab-abilities-btn');
        var badge = document.getElementById('sheet-type-badge');

        if (currentSheet.sheetType === 'pulp') {
            abilitiesTab.style.display = 'inline-flex';
            badge.textContent = 'PULP';
            badge.className = 'sheet-type-badge pulp';
        } else {
            abilitiesTab.style.display = 'none';
            badge.textContent = 'NORMAL';
            badge.className = 'sheet-type-badge normal';
        }
    }

    function populateEditor() {
        if (!currentSheet) return;

        setVal('char-player', currentSheet.playerName);
        setVal('char-name', currentSheet.characterName);
        setVal('char-age', currentSheet.age);
        setVal('char-occupation', currentSheet.occupation);

        var preview = document.getElementById('portrait-preview');
        var removeBtn = document.getElementById('btn-remove-portrait');
        if (currentSheet.portrait) {
            preview.innerHTML = '<img src="' + currentSheet.portrait + '" alt="Retrato">';
            removeBtn.style.display = 'block';
        } else {
            preview.innerHTML = '<span class="portrait-placeholder">512×512</span>';
            removeBtn.style.display = 'none';
        }

        var attrs = currentSheet.attributes || {};
        document.querySelectorAll('.attr-value').forEach(function(input) {
            var attrKey = input.dataset.attrField;
            var val = (attrs[attrKey] !== undefined && attrs[attrKey] !== null) ? attrs[attrKey] : 0;
            input.value = val;
        });

        setVal('hp-current', currentSheet.hpCurrent || 0);
        setVal('mp-current', currentSheet.mpCurrent || 0);
        setVal('san-current', currentSheet.sanCurrent || 0);

        // Checkboxes
        setCheck('check-major-wound', currentSheet.majorWound);
        setCheck('check-unconscious', currentSheet.unconscious);
        setCheck('check-temp-insanity', currentSheet.tempInsanity);
        setCheck('check-indef-insanity', currentSheet.indefInsanity);

        // Aplicar estilo inicial dos checkboxes
        updateCheckStyle('check-major-wound', currentSheet.majorWound);
        updateCheckStyle('check-unconscious', currentSheet.unconscious);
        updateCheckStyle('check-temp-insanity', currentSheet.tempInsanity);
        updateCheckStyle('check-indef-insanity', currentSheet.indefInsanity);

        updateAllCalculations();

        var skillsContainer = document.getElementById('skills-list');
        Skills.render(skillsContainer, currentSheet, getCurrentAttributes());

        var invContainer = document.getElementById('inventory-list');
        Inventory.render(invContainer, currentSheet.inventory || [], scheduleAutoSave);

        var weaponsContainer = document.getElementById('weapons-list');
        Weapons.render(weaponsContainer, currentSheet.weapons || [], scheduleAutoSave);

        var magicContainer = document.getElementById('magic-list');
        Magic.render(magicContainer, currentSheet.spells || [], scheduleAutoSave);

        var abilitiesContainer = document.getElementById('abilities-list');
        Abilities.render(abilitiesContainer, currentSheet.abilities || [], scheduleAutoSave);

        var relContainer = document.getElementById('relations-list');
        Relations.render(relContainer, currentSheet.relations || [], scheduleAutoSave);

        var personalFields = [
            'personalDescription', 'ideology', 'traits', 'injuries',
            'phobias', 'treasures', 'encounters', 'backstory', 'notes'
        ];
        personalFields.forEach(function(field) {
            var el = document.querySelector('[data-field="' + field + '"]');
            if (el) el.value = currentSheet[field] || '';
        });
    }

    function collectAndSave() {
        if (!currentSheet) return;

        currentSheet.playerName = getVal('char-player');
        currentSheet.characterName = getVal('char-name') || 'Sem Nome';
        currentSheet.age = getVal('char-age');
        currentSheet.occupation = getVal('char-occupation');

        if (!currentSheet.attributes) currentSheet.attributes = {};
        document.querySelectorAll('.attr-value').forEach(function(input) {
            var attrKey = input.dataset.attrField;
            currentSheet.attributes[attrKey] = parseInt(input.value) || 0;
        });

        currentSheet.hpCurrent = parseInt(getVal('hp-current')) || 0;
        currentSheet.mpCurrent = parseInt(getVal('mp-current')) || 0;
        currentSheet.sanCurrent = parseInt(getVal('san-current')) || 0;

        // Checkboxes
        currentSheet.majorWound = getCheck('check-major-wound');
        currentSheet.unconscious = getCheck('check-unconscious');
        currentSheet.tempInsanity = getCheck('check-temp-insanity');
        currentSheet.indefInsanity = getCheck('check-indef-insanity');

        var skillsContainer = document.getElementById('skills-list');
        currentSheet.skills = Skills.collectValues(skillsContainer);

        var invContainer = document.getElementById('inventory-list');
        currentSheet.inventory = Inventory.collectData(invContainer);

        var weaponsContainer = document.getElementById('weapons-list');
        currentSheet.weapons = Weapons.collectData(weaponsContainer);

        var magicContainer = document.getElementById('magic-list');
        currentSheet.spells = Magic.collectData(magicContainer);

        var abilitiesContainer = document.getElementById('abilities-list');
        currentSheet.abilities = Abilities.collectData(abilitiesContainer);

        var relContainer = document.getElementById('relations-list');
        currentSheet.relations = Relations.collectData(relContainer);

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

    function updateAllCalculations() {
        var forVal = parseInt(document.querySelector('[data-attr-field="for"]').value) || 0;
        var conVal = parseInt(document.querySelector('[data-attr-field="con"]').value) || 0;
        var tamVal = parseInt(document.querySelector('[data-attr-field="tam"]').value) || 0;
        var desVal = parseInt(document.querySelector('[data-attr-field="des"]').value) || 0;
        var podVal = parseInt(document.querySelector('[data-attr-field="pod"]').value) || 0;

        document.querySelectorAll('.attr-row').forEach(function(row) {
            var input = row.querySelector('.attr-value');
            var val = parseInt(input.value) || 0;
            var halfEl = row.querySelector('.attr-half');
            var fifthEl = row.querySelector('.attr-fifth');
            if (halfEl) halfEl.textContent = Calculations.half(val);
            if (fifthEl) fifthEl.textContent = Calculations.fifth(val);
        });

        var hpMaxEl = document.getElementById('hp-max');
        if (hpMaxEl) hpMaxEl.textContent = Calculations.calcMaxHP(conVal, tamVal);

        var mpMaxEl = document.getElementById('mp-max');
        if (mpMaxEl) mpMaxEl.textContent = Calculations.calcMaxMP(podVal);

        var sanMaxEl = document.getElementById('san-max');
        if (sanMaxEl) sanMaxEl.textContent = podVal;

        var movEl = document.getElementById('mov-value');
        if (movEl) movEl.textContent = Calculations.calcMOV(forVal, desVal, tamVal);

        var result = Calculations.calcDamageBonusAndBuild(forVal, tamVal);
        var dmgEl = document.getElementById('dmg-bonus');
        if (dmgEl) dmgEl.textContent = result.damageBonus;
        var buildEl = document.getElementById('build-value');
        if (buildEl) buildEl.textContent = result.build;
    }

    function getCurrentAttributes() {
        var attrs = {};
        document.querySelectorAll('.attr-value').forEach(function(input) {
            attrs[input.dataset.attrField] = parseInt(input.value) || 0;
        });
        return attrs;
    }

    /**
     * Atualiza o visual do texto do checkbox ao marcar/desmarcar.
     */
    function updateCheckStyle(id, isChecked) {
        var el = document.getElementById(id);
        if (!el) return;
        var label = el.closest('.status-check-label');
        if (!label) return;
        var textEl = label.querySelector('.check-text');
        if (!textEl) return;

        if (isChecked) {
            textEl.style.opacity = '1';
            textEl.style.fontWeight = '700';
        } else {
            textEl.style.opacity = '0.55';
            textEl.style.fontWeight = '600';
        }
    }

    function scheduleAutoSave() {
        if (autoSaveTimer) clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(function() {
            collectAndSave();
        }, 500);
    }

    function initEditorEvents() {
        document.querySelectorAll('#tab-main .info-section input').forEach(function(input) {
            input.addEventListener('input', scheduleAutoSave);
        });

        document.querySelectorAll('.attr-value').forEach(function(input) {
            input.addEventListener('input', function() {
                updateAllCalculations();

                var attrs = getCurrentAttributes();
                var skillsContainer = document.getElementById('skills-list');
                if (skillsContainer.children.length > 0) {
                    var currentSkillValues = Skills.collectValues(skillsContainer);
                    if (currentSheet) currentSheet.skills = currentSkillValues;
                    Skills.render(skillsContainer, currentSheet || {}, attrs);
                }

                scheduleAutoSave();
            });
        });

        ['hp-current', 'mp-current', 'san-current'].forEach(function(id) {
            var el = document.getElementById(id);
            if (el) el.addEventListener('input', scheduleAutoSave);
        });

        // Checkboxes de status
        ['check-major-wound', 'check-unconscious', 'check-temp-insanity', 'check-indef-insanity'].forEach(function(id) {
            var el = document.getElementById(id);
            if (el) {
                el.addEventListener('change', function() {
                    updateCheckStyle(id, this.checked);
                    scheduleAutoSave();
                });
            }
        });

        document.getElementById('portrait-upload').addEventListener('change', handlePortraitUpload);
        document.getElementById('btn-remove-portrait').addEventListener('click', removePortrait);

        document.getElementById('skills-list').addEventListener('input', function(e) {
            if (e.target.classList.contains('skill-value')) {
                var row = e.target.closest('.skill-row');
                var val = parseInt(e.target.value) || 0;
                Skills.updateCalculations(row, val);
                scheduleAutoSave();
            }
        });

        document.getElementById('btn-add-item').addEventListener('click', function() {
            if (!currentSheet.inventory) currentSheet.inventory = [];
            currentSheet.inventory.push(Inventory.createEmptyItem());
            Inventory.render(document.getElementById('inventory-list'), currentSheet.inventory, scheduleAutoSave);
            scheduleAutoSave();
        });

        document.getElementById('btn-add-weapon').addEventListener('click', function() {
            if (!currentSheet.weapons) currentSheet.weapons = [];
            currentSheet.weapons.push(Weapons.createEmptyWeapon());
            Weapons.render(document.getElementById('weapons-list'), currentSheet.weapons, scheduleAutoSave);
            scheduleAutoSave();
        });

        document.getElementById('btn-add-spell').addEventListener('click', function() {
            if (!currentSheet.spells) currentSheet.spells = [];
            currentSheet.spells.push(Magic.createEmptySpell());
            Magic.render(document.getElementById('magic-list'), currentSheet.spells, scheduleAutoSave);
            scheduleAutoSave();
        });

        document.getElementById('btn-add-ability').addEventListener('click', function() {
            if (!currentSheet.abilities) currentSheet.abilities = [];
            currentSheet.abilities.push(Abilities.createEmptyAbility());
            Abilities.render(document.getElementById('abilities-list'), currentSheet.abilities, scheduleAutoSave);
            scheduleAutoSave();
        });

        document.getElementById('btn-add-relation').addEventListener('click', function() {
            if (!currentSheet.relations) currentSheet.relations = [];
            currentSheet.relations.push(Relations.createEmptyRelation());
            Relations.render(document.getElementById('relations-list'), currentSheet.relations, scheduleAutoSave);
            scheduleAutoSave();
        });

        document.querySelectorAll('#tab-relations textarea').forEach(function(ta) {
            ta.addEventListener('input', scheduleAutoSave);
        });

        document.getElementById('btn-export-sheet').addEventListener('click', function() {
            collectAndSave();
            var json = Storage.exportSingleSheet(currentSheet.id);
            if (json) {
                downloadJSON(json, 'callkeeper_' + (currentSheet.characterName || 'ficha').replace(/\s+/g, '_') + '.json');
            }
        });

        document.getElementById('btn-delete-sheet').addEventListener('click', function() {
            if (confirm('Tem certeza que deseja excluir a ficha "' + currentSheet.characterName + '"?')) {
                Storage.deleteSheet(currentSheet.id);
                currentSheet = null;
                App.showScreen('sheets');
            }
        });

        document.getElementById('btn-back-to-list').addEventListener('click', function() {
            collectAndSave();
            currentSheet = null;
            App.showScreen('sheets');
        });
    }

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

    function removePortrait() {
        currentSheet.portrait = null;
        document.getElementById('portrait-preview').innerHTML = '<span class="portrait-placeholder">512×512</span>';
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

    function setCheck(id, value) {
        var el = document.getElementById(id);
        if (el) el.checked = value || false;
    }

    function getCheck(id) {
        var el = document.getElementById(id);
        return el ? el.checked : false;
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
