/**
 * CallKeeper — Módulo de Armazenamento (localStorage)
 * Gerencia persistência de dados de usuários e fichas.
 */

const Storage = (() => {
    const USERS_KEY = 'callkeeper_users';
    const CURRENT_USER_KEY = 'callkeeper_current_user';

    /**
     * Obtém todos os usuários registrados.
     */
    function getUsers() {
        try {
            const data = localStorage.getItem(USERS_KEY);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            console.error('Erro ao ler usuários:', e);
            return {};
        }
    }

    /**
     * Salva todos os usuários.
     */
    function saveUsers(users) {
        try {
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
        } catch (e) {
            console.error('Erro ao salvar usuários:', e);
            alert('Erro ao salvar dados. O armazenamento local pode estar cheio.');
        }
    }

    /**
     * Registra um novo usuário. Retorna true se sucesso.
     */
    function registerUser(username, password) {
        const users = getUsers();
        const key = username.toLowerCase().trim();
        if (users[key]) {
            return { success: false, message: 'Usuário já existe.' };
        }
        users[key] = {
            username: username.trim(),
            password: password,
            sheets: []
        };
        saveUsers(users);
        return { success: true };
    }

    /**
     * Autentica um usuário. Retorna o objeto do usuário ou null.
     */
    function authenticateUser(username, password) {
        const users = getUsers();
        const key = username.toLowerCase().trim();
        const user = users[key];
        if (user && user.password === password) {
            return user;
        }
        return null;
    }

    /**
     * Define o usuário logado atual.
     */
    function setCurrentUser(username) {
        localStorage.setItem(CURRENT_USER_KEY, username.toLowerCase().trim());
    }

    /**
     * Obtém o nome do usuário logado atual.
     */
    function getCurrentUser() {
        return localStorage.getItem(CURRENT_USER_KEY);
    }

    /**
     * Remove o usuário logado (logout).
     */
    function clearCurrentUser() {
        localStorage.removeItem(CURRENT_USER_KEY);
    }

    /**
     * Obtém todas as fichas do usuário atual.
     */
    function getSheets() {
        const users = getUsers();
        const current = getCurrentUser();
        if (!current || !users[current]) return [];
        return users[current].sheets || [];
    }

    /**
     * Salva todas as fichas do usuário atual.
     */
    function saveSheets(sheets) {
        const users = getUsers();
        const current = getCurrentUser();
        if (!current || !users[current]) return;
        users[current].sheets = sheets;
        saveUsers(users);
    }

    /**
     * Obtém uma ficha pelo ID.
     */
    function getSheetById(id) {
        const sheets = getSheets();
        return sheets.find(s => s.id === id) || null;
    }

    /**
     * Salva (cria ou atualiza) uma ficha.
     */
    function saveSheet(sheet) {
        const sheets = getSheets();
        const index = sheets.findIndex(s => s.id === sheet.id);
        if (index >= 0) {
            sheets[index] = sheet;
        } else {
            sheets.push(sheet);
        }
        saveSheets(sheets);
    }

    /**
     * Remove uma ficha pelo ID.
     */
    function deleteSheet(id) {
        let sheets = getSheets();
        sheets = sheets.filter(s => s.id !== id);
        saveSheets(sheets);
    }

    /**
     * Exporta todas as fichas como JSON string.
     */
    function exportAllSheets() {
        const sheets = getSheets();
        return JSON.stringify({
            app: 'CallKeeper',
            version: '1.0',
            exportedAt: new Date().toISOString(),
            sheets: sheets
        }, null, 2);
    }

    /**
     * Exporta uma única ficha como JSON string.
     */
    function exportSingleSheet(id) {
        const sheet = getSheetById(id);
        if (!sheet) return null;
        return JSON.stringify({
            app: 'CallKeeper',
            version: '1.0',
            exportedAt: new Date().toISOString(),
            sheets: [sheet]
        }, null, 2);
    }

    /**
     * Importa fichas de um JSON string. Retorna quantidade importada.
     */
    function importSheets(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (!data.sheets || !Array.isArray(data.sheets)) {
                return { success: false, message: 'Formato de arquivo inválido.' };
            }
            const currentSheets = getSheets();
            let imported = 0;
            data.sheets.forEach(importedSheet => {
                // Gerar novo ID para evitar conflitos
                importedSheet.id = generateId();
                importedSheet.importedAt = new Date().toISOString();
                currentSheets.push(importedSheet);
                imported++;
            });
            saveSheets(currentSheets);
            return { success: true, count: imported };
        } catch (e) {
            return { success: false, message: 'Erro ao ler o arquivo JSON.' };
        }
    }

    /**
     * Gera um ID único simples.
     */
    function generateId() {
        return 'ck_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
    }

    return {
        registerUser,
        authenticateUser,
        setCurrentUser,
        getCurrentUser,
        clearCurrentUser,
        getSheets,
        saveSheets,
        getSheetById,
        saveSheet,
        deleteSheet,
        exportAllSheets,
        exportSingleSheet,
        importSheets,
        generateId
    };
})();
