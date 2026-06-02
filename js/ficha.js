// ======================================
// SESSÃO
// ======================================

const session =
JSON.parse(
localStorage.getItem(
"arkham_session"
)
);

if(!session){

```
window.location.href =
    "index.html";
```

}

// ======================================
// ATRIBUTOS
// ======================================

const ATTRIBUTES = [

```
"FOR",
"CON",
"TAM",
"DES",
"APA",
"EDU",
"INT",
"POD",
"SOR"
```

];

// ======================================
// ELEMENTOS
// ======================================

const atributosContainer =
document.getElementById(
"atributosContainer"
);

const saveSheetButton =
document.getElementById(
"saveSheetButton"
);

const backButton =
document.getElementById(
"backButton"
);

// ======================================
// USUÁRIOS
// ======================================

function getUsers(){

```
return JSON.parse(
    localStorage.getItem(
        "arkham_users"
    )
) || [];
```

}

function saveUsers(users){

```
localStorage.setItem(
    "arkham_users",
    JSON.stringify(users)
);
```

}

function getCurrentUser(){

```
const users =
    getUsers();

return users.find(
    user =>
        user.username ===
        session.username
);
```

}

// ======================================
// FICHA ATUAL
// ======================================

const fichaAtualId =
localStorage.getItem(
"fichaAtual"
);

let currentSheet = null;

function loadCurrentSheet(){

```
const user =
    getCurrentUser();

currentSheet =
    user.fichas.find(
        ficha =>
            ficha.id ===
            fichaAtualId
    );
```

}

loadCurrentSheet();

// ======================================
// SISTEMA DE ABAS
// ======================================

const tabButtons =
document.querySelectorAll(
".tab-button"
);

const tabContents =
document.querySelectorAll(
".tab-content"
);

tabButtons.forEach(button => {

```
button.addEventListener(
    "click",
    () => {

        tabButtons.forEach(btn =>
            btn.classList.remove(
                "active"
            )
        );

        tabContents.forEach(tab =>
            tab.classList.remove(
                "active"
            )
        );

        button.classList.add(
            "active"
        );

        document
            .getElementById(
                button.dataset.tab
            )
            .classList
            .add(
                "active"
            );

    }
);
```

});

// ======================================
// CRIAR ATRIBUTOS
// ======================================

function createAttributeRow(name){

```
const row =
    document.createElement(
        "div"
    );

row.className =
    "attribute-row";

row.innerHTML = `

    <label>
        ${name}
    </label>

    <input
        type="number"
        id="${name}"
        value="0"
    >

    <input
        id="${name}_half"
        readonly
    >

    <input
        id="${name}_fifth"
        readonly
    >

`;

atributosContainer
    .appendChild(row);

const attributeField =
    document.getElementById(
        name
    );

attributeField.addEventListener(
    "input",
    () => {

        updateAttribute(
            name
        );

        recalculateSheet();

    }
);
```

}

// ======================================
// ATUALIZAR ATRIBUTO
// ======================================

function updateAttribute(name){

```
const value =
    Number(
        document
        .getElementById(name)
        .value
    ) || 0;

document
    .getElementById(
        `${name}_half`
    )
    .value =
    getHalf(value);

document
    .getElementById(
        `${name}_fifth`
    )
    .value =
    getFifth(value);
```

}

// ======================================
// GERAR ATRIBUTOS
// ======================================

function generateAttributes(){

```
atributosContainer.innerHTML =
    "";

ATTRIBUTES.forEach(attr => {

    createAttributeRow(
        attr
    );

    updateAttribute(
        attr
    );

});
```

}

generateAttributes();

// ======================================
// BOTÃO DASHBOARD
// ======================================

backButton.addEventListener(
"click",
() => {

```
    window.location.href =
        "dashboard.html";

}
```

);

// ======================================
// SALVAR
// ======================================

saveSheetButton.addEventListener(
"click",
() => {

```
    alert(
        "Sistema de salvamento será implementado no próximo bloco."
    );

}
```

);
