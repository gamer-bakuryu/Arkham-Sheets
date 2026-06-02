// =========================
// ELEMENTOS
// =========================

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");

const loginButton = document.getElementById("loginButton");
const registerButton = document.getElementById("registerButton");

// =========================
// TROCA DE TELAS
// =========================

showRegister?.addEventListener("click", (event) => {

```
event.preventDefault();

loginForm.style.display = "none";
registerForm.style.display = "block";
```

});

showLogin?.addEventListener("click", (event) => {

```
event.preventDefault();

registerForm.style.display = "none";
loginForm.style.display = "block";
```

});

// =========================
// UTILIDADES
// =========================

function getUsers() {

```
const users = localStorage.getItem("arkham_users");

return users ? JSON.parse(users) : [];
```

}

function saveUsers(users) {

```
localStorage.setItem(
    "arkham_users",
    JSON.stringify(users)
);
```

}

// =========================
// CADASTRO
// =========================

registerButton?.addEventListener("click", () => {

```
const username =
    document.getElementById("registerUser")
    .value
    .trim();

const password =
    document.getElementById("registerPassword")
    .value
    .trim();

if (!username || !password) {

    alert("Preencha todos os campos.");

    return;
}

const users = getUsers();

const userExists = users.find(
    user => user.username === username
);

if (userExists) {

    alert("Usuário já existe.");

    return;
}

users.push({

    username,
    password,

    fichas: []

});

saveUsers(users);

alert("Conta criada com sucesso.");

registerForm.style.display = "none";
loginForm.style.display = "block";
```

});

// =========================
// LOGIN
// =========================

loginButton?.addEventListener("click", () => {

```
const username =
    document.getElementById("loginUser")
    .value
    .trim();

const password =
    document.getElementById("loginPassword")
    .value
    .trim();

const users = getUsers();

const user = users.find(
    user =>
        user.username === username &&
        user.password === password
);

if (!user) {

    alert("Usuário ou senha inválidos.");

    return;
}

localStorage.setItem(
    "arkham_session",
    JSON.stringify({
        username: user.username
    })
);

window.location.href =
    "dashboard.html";
```

});

// =========================
// LOGIN AUTOMÁTICO
// =========================

const session =
localStorage.getItem("arkham_session");

if (session) {

```
window.location.href =
    "dashboard.html";
```

}
