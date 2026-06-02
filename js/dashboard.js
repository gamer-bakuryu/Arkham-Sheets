// =========================
// SESSÃO
// =========================

const session =
JSON.parse(
localStorage.getItem("arkham_session")
);

if (!session) {

```
window.location.href = "index.html";
```

}

// =========================
// ELEMENTOS
// =========================

const welcomeUser =
document.getElementById("welcomeUser");

const logoutButton =
document.getElementById("logoutButton");

const newCharacterButton =
document.getElementById("newCharacterButton");

const sheetList =
document.getElementById("sheetList");

// =========================
// USUÁRIOS
// =========================

function getUsers() {

```
return JSON.parse(
    localStorage.getItem("arkham_users")
) || [];
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

function getCurrentUser() {

```
const users = getUsers();

return users.find(
    user =>
        user.username === session.username
);
```

}

// =========================
// CABEÇALHO
// =========================

welcomeUser.textContent =
`Bem-vindo, ${session.username}`;

// =========================
// LOGOUT
// =========================

logoutButton.addEventListener(
"click",
() => {

```
    localStorage.removeItem(
        "arkham_session"
    );

    window.location.href =
        "index.html";

}
```

);

// =========================
// ID ÚNICO
// =========================

function generateId() {

```
return Date.now().toString();
```

}

// =========================
// NOVA FICHA
// =========================

newCharacterButton.addEventListener(
"click",
() => {

```
    const users = getUsers();

    const userIndex =
        users.findIndex(
            user =>
                user.username ===
                session.username
        );

    const novaFicha = {

        id: generateId(),

        sistema:
            "Chamado de Cthulhu 7e",

        jogador: "",

        personagem:
            "Nova Ficha",

        idade: "",

        profissao: "",

        atributos: {},

        status: {},

        pericias: {},

        inventario: [],

        armas: [],

        magias: [],

        relacoes: []

    };

    users[userIndex]
        .fichas
        .push(novaFicha);

    saveUsers(users);

    localStorage.setItem(
        "fichaAtual",
        novaFicha.id
    );

    window.location.href =
        "ficha.html";

}
```

);

// =========================
// CARREGAR FICHAS
// =========================

function renderSheets() {

```
const user =
    getCurrentUser();

sheetList.innerHTML = "";

if (
    !user ||
    !user.fichas ||
    user.fichas.length === 0
) {

    sheetList.innerHTML = `
        <p>
            Nenhuma ficha criada.
        </p>
    `;

    return;
}

user.fichas.forEach(
    ficha => {

        const card =
            document.createElement("div");

        card.classList.add(
            "sheet-card"
        );

        card.innerHTML = `

            <h3>
                ${ficha.personagem}
            </h3>

            <p>
                ${ficha.sistema}
            </p>

            <div class="sheet-actions">

                <button
                    onclick="editSheet('${ficha.id}')"
                >
                    Editar
                </button>

                <button
                    onclick="duplicateSheet('${ficha.id}')"
                >
                    Duplicar
                </button>

                <button
                    onclick="deleteSheet('${ficha.id}')"
                >
                    Excluir
                </button>

            </div>

        `;

        sheetList.appendChild(
            card
        );

    }
);
```

}

// =========================
// EDITAR
// =========================

function editSheet(id) {

```
localStorage.setItem(
    "fichaAtual",
    id
);

window.location.href =
    "ficha.html";
```

}

window.editSheet =
editSheet;

// =========================
// DUPLICAR
// =========================

function duplicateSheet(id) {

```
const users =
    getUsers();

const userIndex =
    users.findIndex(
        user =>
            user.username ===
            session.username
    );

const fichaOriginal =
    users[userIndex]
    .fichas
    .find(
        ficha =>
            ficha.id === id
    );

const copia =
    structuredClone(
        fichaOriginal
    );

copia.id =
    generateId();

copia.personagem +=
    " (Cópia)";

users[userIndex]
    .fichas
    .push(copia);

saveUsers(users);

renderSheets();
```

}

window.duplicateSheet =
duplicateSheet;

// =========================
// EXCLUIR
// =========================

function deleteSheet(id) {

```
const confirmar =
    confirm(
        "Deseja excluir esta ficha?"
    );

if (!confirmar) {

    return;

}

const users =
    getUsers();

const userIndex =
    users.findIndex(
        user =>
            user.username ===
            session.username
    );

users[userIndex].fichas =
    users[userIndex]
    .fichas
    .filter(
        ficha =>
            ficha.id !== id
    );

saveUsers(users);

renderSheets();
```

}

window.deleteSheet =
deleteSheet;

// =========================
// INICIALIZAÇÃO
// =========================

renderSheets();
