import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ErrorFormula, masaMolar, parsearFormula } from "../src/quimica/formula.js";

describe("parsearFormula", () => {
    it("cuenta atomos simples y con subindices de varias cifras", () => {
        assert.deepEqual(parsearFormula("H2O"), { H: 2, O: 1 });
        assert.deepEqual(parsearFormula("C12H22O11"), { C: 12, H: 22, O: 11 });
    });

    it("entiende parentesis y parentesis dentro de parentesis", () => {
        assert.deepEqual(parsearFormula("Ca(OH)2"), { Ca: 1, O: 2, H: 2 });
        assert.deepEqual(parsearFormula("Al2(SO4)3"), { Al: 2, S: 3, O: 12 });
        assert.deepEqual(parsearFormula("K4(Fe(CN)6)"), { K: 4, Fe: 1, C: 6, N: 6 });
    });

    it("diferencia Co de CO y rechaza elementos que no conoce", () => {
        assert.throws(() => parsearFormula("Xx2"), /desconocido: Xx/);
        assert.deepEqual(parsearFormula("CO2"), { C: 1, O: 2 });
    });

    it("rechaza formulas mal escritas", () => {
        for (const mala of ["", "h2o", "H2O)", "(H2O", "H0", "H2 O", "Na+Cl"]) assert.throws(() => parsearFormula(mala), ErrorFormula, mala);
    });
});

describe("masaMolar", () => {
    it("agua 18.015 y acido sulfurico 98.072", () => {
        assert.equal(masaMolar("H2O").masaMolar, 18.015);
        assert.equal(masaMolar("H2SO4").masaMolar, 98.072);
    });

    it("da el aporte de cada elemento", () => {
        assert.deepEqual(masaMolar("NaCl").detalle, [
            { simbolo: "Na", cantidad: 1, aporte: 22.99 },
            { simbolo: "Cl", cantidad: 1, aporte: 35.45 }
        ]);
    });
});
