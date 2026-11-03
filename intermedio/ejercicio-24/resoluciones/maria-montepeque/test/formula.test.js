import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parsearFormula } from "../src/utils/formula.js";

describe("parsearFormula", () => {
    // tabla de casos: formula => lo que deberia salir
    const casos = [
        ["H2O", { H: 2, O: 1 }],
        ["NaCl", { Na: 1, Cl: 1 }],
        ["C6H12O6", { C: 6, H: 12, O: 6 }],
        ["Ca(OH)2", { Ca: 1, O: 2, H: 2 }],
        ["Al2(SO4)3", { Al: 2, S: 3, O: 12 }],
        ["K4(Fe(CN)6)", { K: 4, Fe: 1, C: 6, N: 6 }],
        ["CH3COOH", { C: 2, H: 4, O: 2 }],
        ["  O2  ", { O: 2 }]
    ];

    for (const [formula, esperado] of casos) {
        it(`${formula.trim()} => ${JSON.stringify(esperado)}`, () => {
            assert.deepEqual(parsearFormula(formula), esperado);
        });
    }

    const malas = [
        ["", /obligatoria/],
        ["h2o", /Caracter no valido "h"/],
        ["2H2O", /Caracter no valido "2"/],
        ["H2O)", /de mas/],
        ["(OH", /Falta cerrar/],
        ["()2", /vacio/],
        ["H0", /no puede ser 0/],
        ["H2-O", /Caracter no valido "-"/],
        ["H".repeat(51), /demasiado larga/]
    ];

    for (const [formula, mensaje] of malas) {
        it(`rechaza "${formula.slice(0, 10)}"`, () => {
            assert.throws(() => parsearFormula(formula), { statusCode: 400, message: mensaje });
        });
    }

    it("rechaza algo que no es texto", () => {
        assert.throws(() => parsearFormula(undefined), { statusCode: 400 });
        assert.throws(() => parsearFormula(42), { statusCode: 400 });
    });
});
