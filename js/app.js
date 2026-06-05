/**
 * CallKeeper — Módulo Principal da Aplicação
 */

var App = (function() {
    var screens = {
        login: 'login-screen',
        sheets: 'sheets-screen',
        editor: 'editor-screen'
    };

    function showScreen(screenName) {
        Object.keys(screens).forEach(function(key) {
            document.getElementById(screens[key]).classList.remove('active');
        });
        document.getElementById(screens[screenName]).classList.add('active');

        if (screenName === 'sheets') {
            renderSheetsList();
            updateUserDisplay();
        }
        if (screenName === 'editor') {
            activateTab('tab-main');
        }
    }

    function renderSheetsList() {
        var sheets = Storage.getSheets();
        var container = document.getElementById('sheets-list');
        var emptyMsg = document.getElementById('no-sheets-msg');

        container.innerHTML = '';

        if (sheets.length === 0) {
            emptyMsg.style.display = 'block';
            container.style.display = 'none';
            return;
        }

        emptyMsg.style.display = 'none';
        container.style.display = 'grid';

        sheets.forEach(function(sheet) {
            var card = document.createElement('div');
            card.className = 'sheet-card';
            card.dataset.id = sheet.id;

            var charName = sheet.characterName || 'Sem Nome';
            var playerName = sheet.playerName ? 'Jogador: ' + sheet.playerName : 'Jogador não definido';
            var occupation = sheet.occupation || 'Profissão não definida';
            var age = sheet.age ? ', ' + sheet.age + ' anos' : '';
            var type = sheet.sheetType || 'normal';
            var typeLabel = type === 'pulp' ? 'Pulp' : 'Normal';
            var typeClass = type === 'pulp' ? 'pulp' : 'normal';

            card.innerHTML =
                '<span class="sheet-card-name">' + escapeHtml(charName) + '</span>' +
                '<span class="sheet-card-player">' + escapeHtml(playerName) + '</span>' +
                '<span class="sheet-card-info">' + escapeHtml(occupation) + escapeHtml(age) + '</span>' +
                '<span class="sheet-card-type ' + typeClass + '">' + typeLabel + '</span>';

            card.addEventListener('click', function() {
                SheetEditor.openSheet(sheet.id);
            });

            container.appendChild(card);
        });
    }

    function updateUserDisplay() {
        var display = document.getElementById('logged-user-display');
        var currentUser = Storage.getCurrentUser();
        if (currentUser && display) {
            var users = JSON.parse(localStorage.getItem('callkeeper_users') || '{}');
            var user = users[currentUser];
            display.textContent = user ? '\uD83D\uDC64 ' + user.username : '';
        }
    }

    function activateTab(tabId) {
        document.querySelectorAll('.tab-btn').forEach(function(btn) {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });
        document.querySelectorAll('.tab-content').forEach(function(content) {
            content.classList.toggle('active', content.id === tabId);
        });
    }

    function openSheetTypeModal() {
        document.getElementById('sheet-type-overlay').classList.add('active');
    }

    function closeSheetTypeModal() {
        document.getElementById('sheet-type-overlay').classList.remove('active');
    }

    function openSupportModal() {
        document.getElementById('support-overlay').classList.add('active');
    }

    function closeSupportModal() {
        document.getElementById('support-overlay').classList.remove('active');
    }

    function init() {
        // Sistema de abas
        document.querySelectorAll('.tab-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                activateTab(btn.dataset.tab);
            });
        });

        // Nova ficha
        document.getElementById('btn-new-sheet').addEventListener('click', function() {
            openSheetTypeModal();
        });

        // Seleção de tipo: Normal
        document.getElementById('btn-create-normal').addEventListener('click', function() {
            closeSheetTypeModal();
            SheetEditor.openSheet(null, 'normal');
        });

        // Seleção de tipo: Pulp
        document.getElementById('btn-create-pulp').addEventListener('click', function() {
            closeSheetTypeModal();
            SheetEditor.openSheet(null, 'pulp');
        });

        // Fechar modal de tipo
        document.getElementById('sheet-type-close').addEventListener('click', function() {
            closeSheetTypeModal();
        });

        document.getElementById('sheet-type-overlay').addEventListener('click', function(e) {
            if (e.target === this) closeSheetTypeModal();
        });

        // Botão de apoio
        document.getElementById('btn-support').addEventListener('click', function() {
            openSupportModal();
        });

        // Fechar modal de apoio
        document.getElementById('support-close').addEventListener('click', function() {
            closeSupportModal();
        });

        document.getElementById('support-overlay').addEventListener('click', function(e) {
            if (e.target === this) closeSupportModal();
        });

        // Logout
        document.getElementById('btn-logout').addEventListener('click', function() {
            Auth.logout();
        });

        // Exportar todas as fichas
        document.getElementById('btn-export-all').addEventListener('click', function() {
            var json = Storage.exportAllSheets();
            downloadJSON(json, 'callkeeper_backup_' + Date.now() + '.json');
        });

        // Importar fichas
        document.getElementById('btn-import-all').addEventListener('change', function(e) {
            var file = e.target.files[0];
            if (!file) return;

            var reader = new FileReader();
            reader.onload = function(evt) {
                var result = Storage.importSheets(evt.target.result);
                if (result.success) {
                    alert(result.count + ' ficha(s) importada(s) com sucesso!');
                    renderSheetsList();
                } else {
                    alert('Erro ao importar: ' + result.message);
                }
            };
            reader.readAsText(file);
            e.target.value = '';
        });

        // Inicializar módulo de instruções
        Instructions.init();

        // Inicializar eventos do editor
        SheetEditor.initEditorEvents();

        // Inicializar autenticação
        var isLoggedIn = Auth.init();
        if (!isLoggedIn) {
            showScreen('login');
        }

        // ESC fecha modais
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                var typeOverlay = document.getElementById('sheet-type-overlay');
                if (typeOverlay.classList.contains('active')) {
                    closeSheetTypeModal();
                    return;
                }
                var supportOverlay = document.getElementById('support-overlay');
                if (supportOverlay.classList.contains('active')) {
                    closeSupportModal();
                    return;
                }
            }
        });
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

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    document.addEventListener('DOMContentLoaded', init);

    return { showScreen: showScreen };
})();
