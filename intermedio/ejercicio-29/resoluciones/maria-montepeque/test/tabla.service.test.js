import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calcularTabla } from "../src/services/tabla.service.js";

// en la version de antes esto no se podia probar solo: estaba dentro de la ruta
// ahora es una funcion pura y se prueba sin servidor

const equipos = [
    { id: 1, nombre: "Azul" },
    { id: 2, nombre: "Rojo" },
    { id: 3, nombre: "Verde" }
];

describe("calcularTabla", () => {
    it("sin partidos todos en 0 y por nombre", () => {
        const tabla = calcularTabla(equipos, []);
        assert.deepEqual(tabla.map((f) => f.nombre), ["Azul", "Rojo", "Verde"]);
        assert.ok(tabla.every((f) => f.pts === 0 && f.pj === 0));
    });

    it("victoria 3, empate 1, derrota 0", () => {
        const tabla = calcularTabla(equipos, [
            { localId: 1, visitanteId: 2, golesLocal: 2, golesVisitante: 0 },
            { localId: 2, visitanteId: 3, golesLocal: 1, golesVisitante: 1 }
        ]);

        const pts = Object.fromEntries(tabla.map((f) => [f.nombre, f.pts]));
        assert.deepEqual(pts, { Azul: 3, Rojo: 1, Verde: 1 });
    });

    it("cuenta goles desde los dos lados", () => {
        const [azul] = calcularTabla([equipos[0], equipos[1]], [{ localId: 2, visitanteId: 1, golesLocal: 1, golesVisitante: 4 }]);
        assert.deepEqual(
            { gf: azul.gf, gc: azul.gc, dg: azul.dg, pg: azul.pg },
            { gf: 4, gc: 1, dg: 3, pg: 1 }
        );
    });

    it("ignora partidos de equipos que no estan en la lista (otra modalidad)", () => {
        const tabla = calcularTabla([equipos[0]], [{ localId: 1, visitanteId: 99, golesLocal: 3, golesVisitante: 0 }]);
        assert.equal(tabla[0].pj, 0);
    });

    it("no cambia los arreglos que recibe", () => {
        const partidos = [{ localId: 1, visitanteId: 2, golesLocal: 1, golesVisitante: 0 }];
        const copia = structuredClone({ equipos, partidos });

        calcularTabla(equipos, partidos);

        assert.deepEqual({ equipos, partidos }, copia);
    });
});
