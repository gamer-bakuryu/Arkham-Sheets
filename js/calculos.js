// ====================================
// UTILIDADES
// ====================================

function floor(value){

```
return Math.floor(
    Number(value) || 0
);
```

}

// ====================================
// METADE
// ====================================

function getHalf(value){

```
return floor(
    value / 2
);
```

}

// ====================================
// QUINTO
// ====================================

function getFifth(value){

```
return floor(
    value / 5
);
```

}

// ====================================
// PV MÁXIMO
// (CON + TAM) / 5
// ====================================

function calculateHP(con, tam){

```
return floor(
    (Number(con) + Number(tam)) / 5
);
```

}

// ====================================
// PM MÁXIMO
// POD / 5
// ====================================

function calculateMP(pod){

```
return floor(
    Number(pod) / 5
);
```

}

// ====================================
// SANIDADE MÁXIMA
// ====================================

function calculateSAN(pod){

```
return floor(
    Number(pod)
);
```

}

// ====================================
// MOVIMENTO
// ====================================

function calculateMOV(
str,
dex,
siz
){

```
str = Number(str);
dex = Number(dex);
siz = Number(siz);

if(
    str < siz &&
    dex < siz
){
    return 7;
}

if(
    str > siz &&
    dex > siz
){
    return 9;
}

return 8;
```

}

// ====================================
// DANO EXTRA E CORPO
// ====================================

function calculateBuildAndDamageBonus(
str,
siz
){

```
const total =
    Number(str) +
    Number(siz);

if(total <= 64){

    return {
        damageBonus:"-2",
        build:-2
    };

}

if(total <= 84){

    return {
        damageBonus:"-1",
        build:-1
    };

}

if(total <= 124){

    return {
        damageBonus:"Nenhum",
        build:0
    };

}

if(total <= 164){

    return {
        damageBonus:"+1D4",
        build:1
    };

}

if(total <= 204){

    return {
        damageBonus:"+1D6",
        build:2
    };

}

if(total <= 284){

    return {
        damageBonus:"+2D6",
        build:3
    };

}

if(total <= 364){

    return {
        damageBonus:"+3D6",
        build:4
    };

}

if(total <= 444){

    return {
        damageBonus:"+4D6",
        build:5
    };

}

if(total <= 524){

    return {
        damageBonus:"+5D6",
        build:6
    };

}

const extra =
    Math.ceil(
        (total - 524) / 80
    );

return {

    damageBonus:
        `+${5 + extra}D6`,

    build:
        6 + extra

};
```

}

// ====================================
// RECALCULAR STATUS
// ====================================

function recalculateSheet(){

```
const FOR =
    Number(
        document.getElementById("FOR")?.value
    ) || 0;

const CON =
    Number(
        document.getElementById("CON")?.value
    ) || 0;

const TAM =
    Number(
        document.getElementById("TAM")?.value
    ) || 0;

const DES =
    Number(
        document.getElementById("DES")?.value
    ) || 0;

const POD =
    Number(
        document.getElementById("POD")?.value
    ) || 0;

const hp =
    calculateHP(
        CON,
        TAM
    );

const mp =
    calculateMP(
        POD
    );

const san =
    calculateSAN(
        POD
    );

const mov =
    calculateMOV(
        FOR,
        DES,
        TAM
    );

const combat =
    calculateBuildAndDamageBonus(
        FOR,
        TAM
    );

const hpMax =
    document.getElementById(
        "pvMax"
    );

const pmMax =
    document.getElementById(
        "pmMax"
    );

const sanMax =
    document.getElementById(
        "sanMax"
    );

const movField =
    document.getElementById(
        "mov"
    );

const damageField =
    document.getElementById(
        "danoExtra"
    );

const buildField =
    document.getElementById(
        "corpo"
    );

if(hpMax){

    hpMax.value = hp;

}

if(pmMax){

    pmMax.value = mp;

}

if(sanMax){

    sanMax.value = san;

}

if(movField){

    movField.value = mov;

}

if(damageField){

    damageField.value =
        combat.damageBonus;

}

if(buildField){

    buildField.value =
        combat.build;

}
```

}

// ====================================
// DISPONIBILIZAR GLOBALMENTE
// ====================================

window.floor = floor;

window.getHalf = getHalf;

window.getFifth = getFifth;

window.calculateHP =
calculateHP;

window.calculateMP =
calculateMP;

window.calculateSAN =
calculateSAN;

window.calculateMOV =
calculateMOV;

window.calculateBuildAndDamageBonus =
calculateBuildAndDamageBonus;

window.recalculateSheet =
recalculateSheet;
