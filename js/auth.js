/**
 * CallKeeper — Módulo de Autenticação
 */

const Auth = (() => {
    let loginForm, loginUser, loginPass, loginError, btnRegister;

    function init() {
        loginForm = document.getElementById('login-form');
        loginUser = document.getElementById('login-user');
        loginPass = document.getElementById('login-pass');
        loginError = document.getElementById('login-error');
        btnRegister = document.getElementById('btn-register');

        loginForm.addEventListener('submit', handleLogin);
        btnRegister.addEventListener('click', handleRegister);

        // Verificar se já está logado
        const currentUser = Storage.getCurrentUser();
        if (currentUser) {
            const users = JSON.parse(localStorage.getItem('callkeeper_users') || '{}');
            if (users[currentUser]) {
                App.showScreen('sheets');
                return true;
            } else {
                Storage.clearCurrentUser();
            }
        }
        return false;
    }

    function handleLogin(e) {
        e.preventDefault();
        clearError();

        const username = loginUser.value.trim();
        const password = loginPass.value;

        if (!username || !password) {
            showError('Preencha todos os campos.');
            return;
        }

        const user = Storage.authenticateUser(username, password);
        if (user) {
            Storage.setCurrentUser(username);
            loginForm.reset();
            App.showScreen('sheets');
        } else {
            showError('Usuário ou senha incorretos.');
        }
    }

    function handleRegister() {
        clearError();

        const username = loginUser.value.trim();
        const password = loginPass.value;

        if (!username || !password) {
            showError('Preencha todos os campos para criar conta.');
            return;
        }

        if (username.length < 3) {
            showError('O nome de usuário deve ter pelo menos 3 caracteres.');
            return;
        }

        if (password.length < 4) {
            showError('A senha deve ter pelo menos 4 caracteres.');
            return;
        }

        const result = Storage.registerUser(username, password);
        if (result.success) {
            Storage.setCurrentUser(username);
            loginForm.reset();
            App.showScreen('sheets');
        } else {
            showError(result.message);
        }
    }

    function logout() {
        Storage.clearCurrentUser();
        App.showScreen('login');
    }

    function showError(msg) {
        loginError.textContent = msg;
    }

    function clearError() {
        loginError.textContent = '';
    }

    return { init, logout };
})();
