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
            wealth: 0,
            vehicleName: '',
            vehiclePhoto: null,
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
                currentSheet.attributes = { for: 0, con: 0, tam: 0, des: 0, apa: 0, edu: 0, int: 0, pod: 0, sor: 0 };
            }
            if (!currentSheet.sheetType) currentSheet.sheetType = 'normal';
            if (!currentSheet.abilities) currentSheet.abilities = [];
            if (currentSheet.majorWound === undefined) currentSheet.majorWound = false;
            if (currentSheet.unconscious === undefined) currentSheet.unconscious = false;
            if (currentSheet.tempInsanity === undefined) currentSheet.tempInsanity = false;
            if (currentSheet.indefInsanity === undefined) currentSheet.indefInsanity = false;
            if (currentSheet.wealth === undefined) currentSheet.wealth = 0;
            if (currentSheet.vehicleName === undefined) currentSheet.vehicleName = '';
            if (currentSheet.vehiclePhoto === undefined) currentSheet.vehiclePhoto = null;
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

    function formatWealth(value) {
        var num = parseFloat(value) || 0;
        return '$ ' + num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function updateWealthDisplay() {
        var el = document.getElementById('wealth-value');
        if (el && currentSheet) el.textContent = formatWealth(currentSheet.wealth);
    }

    function populateEditor() {
        if (!currentSheet) return;

        setVal('char-player', currentSheet.playerName);
        setVal('char-name', currentSheet.characterName);
        setVal('char-age', currentSheet.age);
        setVal('char-occupation', currentSheet.occupation);

        // Retrato
        var preview = document.getElementById('portrait-preview');
        var removeBtn = document.getElementById('btn-remove-portrait');
        if (currentSheet.portrait) {
            preview.innerHTML = '<img src="' + currentSheet.portrait + '" alt="Retrato">';
            removeBtn.style.display = 'block';
        } else {
            preview.innerHTML = '<span class="portrait-placeholder">512×512</span>';
            removeBtn.style.display = 'none';
        }

        // Atributos
        var attrs = currentSheet.attributes || {};
        document.querySelectorAll('.attr-value').forEach(function(input) {
            var attrKey = input.dataset.attrField;
            input.value = (attrs[attrKey] !== undefined && attrs[attrKey] !== null) ? attrs[attrKey] : 0;
        });

        setVal('hp-current', currentSheet.hpCurrent || 0);
        setVal('mp-current', currentSheet.mpCurrent || 0);
        setVal('san-current', currentSheet.sanCurrent || 0);

        setCheck('check-major-wound', currentSheet.majorWound);
        setCheck('check-unconscious', currentSheet.unconscious);
        setCheck('check-temp-insanity', currentSheet.tempInsanity);
        setCheck('check-indef-insanity', currentSheet.indefInsanity);

        updateCheckStyle('check-major-wound', currentSheet.majorWound);
        updateCheckStyle('check-unconscious', currentSheet.unconscious);
        updateCheckStyle('check-temp-insanity', currentSheet.tempInsanity);
        updateCheckStyle('check-indef-insanity', currentSheet.indefInsanity);

        // Patrimônio
        updateWealthDisplay();

        // Veículo
        setVal('vehicle-name', currentSheet.vehicleName);
        var vPreview = document.getElementById('vehicle-preview');
        var vRemoveBtn = document.getElementById('btn-remove-vehicle-photo');
        if (currentSheet.vehiclePhoto) {
            vPreview.innerHTML = '<img src="' + currentSheet.vehiclePhoto + '" alt="Veículo">';
            vRemoveBtn.style.display = 'block';
        } else {
            vPreview.innerHTML = '<span class="vehicle-placeholder">🚗</span>';
            vRemoveBtn.style.display = 'none';
        }

        updateAllCalculations();

        Skills.render(document.getElementById('skills-list'), currentSheet, getCurrentAttributes());
        Inventory.render(document.getElementById('inventory-list'), currentSheet.inventory || [], scheduleAutoSave);
        Weapons.render(document.getElementById('weapons-list'), currentSheet.weapons || [], scheduleAutoSave);
        Magic.render(document.getElementById('magic-list'), currentSheet.spells || [], scheduleAutoSave);
        Abilities.render(document.getElementById('abilities-list'), currentSheet.abilities || [], scheduleAutoSave);
        Relations.render(document.getElementById('relations-list'), currentSheet.relations || [], scheduleAutoSave);

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
            currentSheet.attributes[input.dataset.attrField] = parseInt(input.value) || 0;
        });

        currentSheet.hpCurrent = parseInt(getVal('hp-current')) || 0;
        currentSheet.mpCurrent = parseInt(getVal('mp-current')) || 0;
        currentSheet.sanCurrent = parseInt(getVal('san-current')) || 0;

        currentSheet.majorWound = getCheck('check-major-wound');
        currentSheet.unconscious = getCheck('check-unconscious');
        currentSheet.tempInsanity = getCheck('check-temp-insanity');
        currentSheet.indefInsanity = getCheck('check-indef-insanity');

        // Veículo
        currentSheet.vehicleName = getVal('vehicle-name');

        currentSheet.skills = Skills.collectValues(document.getElementById('skills-list'));
        currentSheet.inventory = Inventory.collectData(document.getElementById('inventory-list'));
        currentSheet.weapons = Weapons.collectData(document.getElementById('weapons-list'));
        currentSheet.spells = Magic.collectData(document.getElementById('magic-list'));
        currentSheet.abilities = Abilities.collectData(document.getElementById('abilities-list'));
        currentSheet.relations = Relations.collectData(document.getElementById('relations-list'));

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

    function updateCheckStyle(id, isChecked) {
        var el = document.getElementById(id);
        if (!el) return;
        var label = el.closest('.status-check-label');
        if (!label) return;
        var textEl = label.querySelector('.check-text');
        if (!textEl) return;
        textEl.style.opacity = isChecked ? '1' : '0.55';
        textEl.style.fontWeight = isChecked ? '700' : '600';
    }

    function scheduleAutoSave() {
        if (autoSaveTimer) clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(function() { collectAndSave(); }, 500);
    }

    function initEditorEvents() {
        document.querySelectorAll('#tab-main .identity-section input').forEach(function(input) {
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

        ['check-major-wound', 'check-unconscious', 'check-temp-insanity', 'check-indef-insanity'].forEach(function(id) {
            var el = document.getElementById(id);
            if (el) {
                el.addEventListener('change', function() {
                    updateCheckStyle(id, this.checked);
                    scheduleAutoSave();
                });
            }
        });

        // Patrimônio
        document.getElementById('btn-wealth-add').addEventListener('click', function() {
            if (!currentSheet) return;
            var input = document.getElementById('wealth-input');
            var amount = parseFloat(input.value);
            if (isNaN(amount) || amount <= 0) return;
            currentSheet.wealth = (currentSheet.wealth || 0) + amount;
            updateWealthDisplay();
            input.value = '';
            scheduleAutoSave();
        });

        document.getElementById('btn-wealth-remove').addEventListener('click', function() {
            if (!currentSheet) return;
            var input = document.getElementById('wealth-input');
            var amount = parseFloat(input.value);
            if (isNaN(amount) || amount <= 0) return;
            currentSheet.wealth = (currentSheet.wealth || 0) - amount;
            if (currentSheet.wealth < 0) currentSheet.wealth = 0;
            updateWealthDisplay();
            input.value = '';
            scheduleAutoSave();
        });

        // Veículo - nome
        document.getElementById('vehicle-name').addEventListener('input', scheduleAutoSave);

        // Veículo - upload de foto
        document.getElementById('vehicle-upload').addEventListener('change', handleVehicleUpload);
        document.getElementById('btn-remove-vehicle-photo').addEventListener('click', removeVehiclePhoto);

        // Retrato
        document.getElementById('portrait-upload').addEventListener('change', handlePortraitUpload);
        document.getElementById('btn-remove-portrait').addEventListener('click', removePortrait);

        document.getElementById('skills-list').addEventListener('input', function(e) {
            if (e.target.classList.contains('skill-value')) {
                var row = e.target.closest('.skill-row');
                Skills.updateCalculations(row, parseInt(e.target.value) || 0);
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
            if (json) downloadJSON(json, 'callkeeper_' + (currentSheet.characterName || 'ficha').replace(/\s+/g, '_') + '.json');
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
        if (!file || !file.type.startsWith('image/')) return;
        var reader = new FileReader();
        reader.onload = function(evt) {
            var img = new Image();
            img.onload = function() {
                var canvas = document.createElement('canvas');
                canvas.width = 512; canvas.height = 512;
                var ctx = canvas.getContext('2d');
                var size = Math.min(img.width, img.height);
                ctx.drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, 512, 512);
                currentSheet.portrait = canvas.toDataURL('image/jpeg', 0.8);
                document.getElementById('portrait-preview').innerHTML = '<img src="' + currentSheet.portrait + '" alt="Retrato">';
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

    function handleVehicleUpload(e) {
        var file = e.target.files[0];
        if (!file || !file.type.startsWith('image/')) return;
        var reader = new FileReader();
        reader.onload = function(evt) {
            var img = new Image();
            img.onload = function() {
                var canvas = document.createElement('canvas');
                canvas.width = 280; canvas.height = 180;
                var ctx = canvas.getContext('2d');
                // Cover centralizado
                var ratio = Math.max(280 / img.width, 180 / img.height);
                var w = img.width * ratio;
                var h = img.height * ratio;
                ctx.drawImage(img, (280 - w) / 2, (180 - h) / 2, w, h);
                currentSheet.vehiclePhoto = canvas.toDataURL('image/jpeg', 0.8);
                document.getElementById('vehicle-preview').innerHTML = '<img src="' + currentSheet.vehiclePhoto + '" alt="Veículo">';
                document.getElementById('btn-remove-vehicle-photo').style.display = 'block';
                scheduleAutoSave();
            };
            img.src = evt.target.result;
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    }

    function removeVehiclePhoto() {
        currentSheet.vehiclePhoto = null;
        document.getElementById('vehicle-preview').innerHTML = '<span class="vehicle-placeholder">🚗</span>';
        document.getElementById('btn-remove-vehicle-photo').style.display = 'none';
        scheduleAutoSave();
    }

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
        a.href = url; a.download = filename;
        document.body.appendChild(a); a.click();
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
