import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { cotizar, COSTO_MINIMO } from "../src/services/cotizacion.service.js";

// tests unitarios: llamo la funcion directo, sin servidor

describe("cotizar", () => {
    it("calcula precio por metro por metros", () => {
        const resultado = cotizar({ proceso: "TIG", material: "acero", metros: 3 });

        assert.equal(resultado.precioMetro, 80);
        assert.equal(resultado.costo, 240);
        assert.equal(resultado.seAplicoMinimo, false);
    });

    it("acepta metros con decimales", () => {
        const resultado = cotizar({ proceso: "MIG", material: "inoxidable", metros: 2.5 });
        assert.equal(resultado.costo, 275);
    });

    it("cobra el minimo si el trabajo es muy chico", () => {
        const resultado = cotizar({ proceso: "electrodo", material: "acero", metros: 1 });

        assert.equal(resultado.costo, COSTO_MINIMO);
        assert.equal(resultado.seAplicoMinimo, true);
    });

    it("no deja soldar aluminio con electrodo (422)", () => {
        assert.throws(
            () => cotizar({ proceso: "electrodo", material: "aluminio", metros: 5 }),
            { statusCode: 422, message: /aluminio/ }
        );
    });

    it("rechaza un proceso que no existe", () => {
        assert.throws(
            () => cotizar({ proceso: "laser", material: "acero", metros: 1 }),
            (error) => {
                assert.equal(error.statusCode, 400);
                assert.match(error.errors[0], /proceso debe ser uno de/);
                return true;
            }
        );
    });

    // con "in" esto pasaba porque toString esta en el prototipo de todo objeto
    it("no confunde propiedades del prototipo con procesos", () => {
        assert.throws(() => cotizar({ proceso: "toString", material: "acero", metros: 1 }), { statusCode: 400 });
        assert.throws(() => cotizar({ proceso: "MIG", material: "constructor", metros: 1 }), { statusCode: 400 });
    });

    it("junta todos los errores en una sola respuesta", () => {
        assert.throws(
            () => cotizar({ proceso: "MIG", material: "madera", metros: -2 }),
            (error) => {
                assert.equal(error.errors.length, 2);
                return true;
            }
        );
    });

    // el mismo test con varios valores malos
    for (const metros of [0, -1, 501, "3", null, Infinity]) {
        it(`rechaza metros = ${String(metros)}`, () => {
            assert.throws(() => cotizar({ proceso: "MIG", material: "acero", metros }), { statusCode: 400 });
        });
    }
});
