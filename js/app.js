/**
 * CallKeeper — Módulo Principal da Aplicação
 * Orquestra todas as telas e módulos.
 */

const App = (() => {
    const screens = {
        login: 'login-screen',
        sheets: 'sheets-screen',
        editor: 'editor-screen'
    };

    /**
     * Mostra uma tela específica e esconde as demais.
     */
    function showScreen(screenName) {
        Object.values(screens).forEach(id => {
            document.getElementById(id).classList.remove('active');
        });
        document.getElementById(screens[screenName]).classList.add('active');

        // Ações ao entrar em cada tela
        if (screenName === 'sheets') {
            renderSheetsList();
            updateUserDisplay();
        }
        if (screenName === 'editor') {
            // Ativar aba principal por padrão
            activateTab('tab-main');
        }
    }

    /**
     * Renderiza a lista de fichas do usuário.
     */
    function renderSheetsList() {
        const sheets = Storage.getSheets();
        const container = document.getElementById('sheets-list');
        const emptyMsg = document.getElementById('no-sheets-msg');

        container.innerHTML = '';

        if (sheets.length === 0) {
            emptyMsg.style.display = 'block';
            container.style.display = 'none';
            return;
        }

        emptyMsg.style.display = 'none';
        container.style.display = 'grid';

        sheets.forEach(sheet => {
            const card = document.createElement('div');
            card.className = 'sheet-card';
            card.dataset.id = sheet.id;

            const charName = sheet.characterName || 'Sem Nome';
            const playerName = sheet.playerName ? `Jogador: ${sheet.playerName}` : 'Jogador não definido';
            const occupation = sheet.occupation || 'Profissão não definida';
            const age = sheet.age ? `, ${sheet.age} anos` : '';

            card.innerHTML = `
                <span class="sheet-card-name">${escapeHtml(charName)}</span>
                <span class="sheet-card-player">${escapeHtml(playerName)}</span>
                <span class="sheet-card-info">${escapeHtml(occupation)}${escapeHtml(age)}</span>
            `;

            card.addEventListener('click', () => {
                SheetEditor.openSheet(sheet.id);
            });

            container.appendChild(card);
        });
    }

    /**
     * Atualiza o nome do usuário exibido no header.
     */
    function updateUserDisplay() {
        const display = document.getElementById('logged-user-display');
        const currentUser = Storage.getCurrentUser();
        if (currentUser && display) {
            const users = JSON.parse(localStorage.getItem('callkeeper_users') || '{}');
            const user = users[currentUser];
            display.textContent = user ? `👤 ${user.username}` : '';
        }
    }

    /**
     * Ativa uma aba do editor.
     */
    function activateTab(tabId) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tabId);
        });
    }

    /**
     * Inicializa a aplicação.
     */
    function init() {
        // Sistema de abas
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                activateTab(btn.dataset.tab);
            });
        });

        // Nova ficha
        document.getElementById('btn-new-sheet').addEventListener('click', () => {
            SheetEditor.openSheet(null);
        });

        // Logout
        document.getElementById('btn-logout').addEventListener('click', () => {
            Auth.logout();
        });

        // Exportar todas as fichas
        document.getElementById('btn-export-all').addEventListener('click', () => {
            const json = Storage.exportAllSheets();
            downloadJSON(json, `callkeeper_backup_${Date.now()}.json`);
        });

        // Importar fichas
        document.getElementById('btn-import-all').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (evt) => {
                const result = Storage.importSheets(evt.target.result);
                if (result.success) {
                    alert(`${result.count} ficha(s) importada(s) com sucesso!`);
                    renderSheetsList();
                } else {
                    alert(`Erro ao importar: ${result.message}`);
                }
            };
            reader.readAsText(file);
            e.target.value = '';
        });

        // Inicializar eventos do editor
        SheetEditor.initEditorEvents();

        // Inicializar autenticação
        const isLoggedIn = Auth.init();
        if (!isLoggedIn) {
            showScreen('login');
        }
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

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Iniciar quando o DOM estiver pronto
    document.addEventListener('DOMContentLoaded', init);

    return { showScreen };
})();
