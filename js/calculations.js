/**
 * CallKeeper — Módulo de Cálculos
 * Todos os cálculos seguem arredondamento para baixo (Math.floor).
 */

const Calculations = (() => {

    /**
     * Calcula metade arredondada para baixo.
     */
    function half(value) {
        return Math.floor(value / 2);
    }

    /**
     * Calcula quinto arredondado para baixo.
     */
    function fifth(value) {
        return Math.floor(value / 5);
    }

    /**
     * Calcula PV máximo: (CON + TAM) / 5 arredondado para baixo.
     */
    function calcMaxHP(con, tam) {
        return Math.floor((con + tam) / 5);
    }

    /**
     * Calcula PM máximo: POD / 5 arredondado para baixo.
     */
    function calcMaxMP(pod) {
        return Math.floor(pod / 5);
    }

    /**
     * Calcula Movimento (MOV) baseado em FOR, DES e TAM.
     *
     * Se tanto DES quanto FOR possuírem valores menores que TAM: MOV = 7
     * Se FOR ou DES for maior ou igual ao TAM, ou se os três forem iguais: MOV = 8
     * Se FOR e DES forem ambas maiores que TAM: MOV = 9
     */
    function calcMOV(forVal, des, tam) {
        if (forVal > tam && des > tam) {
            return 9;
        }
        if (forVal < tam && des < tam) {
            return 7;
        }
        // FOR ou DES >= TAM, ou todos iguais
        return 8;
    }

    /**
     * Calcula Dano Extra e Corpo baseado em FOR + TAM.
     * Retorna { damageBonus: string, build: number }
     */
    function calcDamageBonusAndBuild(forVal, tam) {
        const dx = forVal + tam;

        if (dx >= 2 && dx <= 64) {
            return { damageBonus: '–2', build: -2 };
        }
        if (dx >= 65 && dx <= 84) {
            return { damageBonus: '–1', build: -1 };
        }
        if (dx >= 85 && dx <= 124) {
            return { damageBonus: 'Nenhum', build: 0 };
        }
        if (dx >= 125 && dx <= 164) {
            return { damageBonus: '+1D4', build: 1 };
        }
        if (dx >= 165 && dx <= 204) {
            return { damageBonus: '+1D6', build: 2 };
        }
        if (dx >= 205 && dx <= 284) {
            return { damageBonus: '+2D6', build: 3 };
        }
        if (dx >= 285 && dx <= 364) {
            return { damageBonus: '+3D6', build: 4 };
        }
        if (dx >= 365 && dx <= 444) {
            return { damageBonus: '+4D6', build: 5 };
        }
        if (dx >= 445 && dx <= 524) {
            return { damageBonus: '+5D6', build: 6 };
        }
        // Acima de 524: +1D6 e +1 Corpo para cada 80 pontos adicionais
        if (dx > 524) {
            const excess = dx - 524;
            const extra = Math.ceil(excess / 80);
            const totalD6 = 5 + extra;
            const totalBuild = 6 + extra;
            return { damageBonus: '+' + totalD6 + 'D6', build: totalBuild };
        }

        // Caso dx < 2 (edge case)
        return { damageBonus: '–2', build: -2 };
    }

    /**
     * Calcula o valor base de Esquivar (metade da DES arredondada para baixo).
     */
    function calcDodgeBase(des) {
        return Math.floor(des / 2);
    }

    return {
        half,
        fifth,
        calcMaxHP,
        calcMaxMP,
        calcMOV,
        calcDamageBonusAndBuild,
        calcDodgeBase
    };
})();
