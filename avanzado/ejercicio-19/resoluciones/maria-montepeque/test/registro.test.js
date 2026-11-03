import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calcularHash, crearRegistroAuditoria, diferencias } from "../src/auditoria/registro.js";

const actor = { id: 1, nombre: "Rosa", rol: "recepcion" };

function registroCon(n) {
    const r = crearRegistroAuditoria();
    for (let i = 1; i <= n; i++) r.anotar({ actor, accion: "citas.crear", recurso: { tipo: "cita", id: i }, despues: { id: i } });
    return r;
}

describe("diferencias", () => {
    it("solo anota los campos que cambiaron", () => {
        assert.deepEqual(diferencias({ fecha: "2026-12-01", cliente: "Ana", estado: "agendada" }, { fecha: "2026-12-05", cliente: "Ana", estado: "agendada" }), {
            fecha: { antes: "2026-12-01", despues: "2026-12-05" }
        });
    });

    it("de los datos sensibles solo dice que cambiaron", () => {
        assert.deepEqual(diferencias({ alergias: undefined }, { alergias: "latex" }), { alergias: { antes: undefined, despues: "[OCULTO]" } });
    });
});

describe("cadena de hashes", () => {
    it("cada entrada apunta al hash de la anterior", () => {
        const r = registroCon(3);
        const [a, b, c] = r.exportar();
        assert.equal(a.hashAnterior, "0".repeat(64));
        assert.equal(b.hashAnterior, a.hash);
        assert.equal(c.hashAnterior, b.hash);
        assert.deepEqual(r.verificar(), { valido: true, entradas: 3, ultimoHash: c.hash });
    });

    it("las entradas guardadas estan congeladas", () => {
        const r = registroCon(1);
        const entrada = r.buscar()[0];
        assert.throws(() => {
            "use strict";
            entrada.accion = "otra cosa";
        }, TypeError);
    });

    it("si alguien cambia el contenido de una entrada, se detecta en cual", () => {
        const copia = registroCon(5).exportar();
        copia[2].actor = { id: 99, nombre: "otro", rol: "admin" };

        assert.deepEqual(crearRegistroAuditoria().verificar(copia), { valido: false, rotaEn: 3, motivo: "el contenido de la entrada fue modificado" });
    });

    it("si alguien cambia el contenido Y recalcula su hash, se rompe la siguiente", () => {
        const copia = registroCon(5).exportar();
        // el atacante cambia la entrada 2 y le pone un hash nuevo que si cuadra...
        copia[1].actor = { id: 99, nombre: "otro", rol: "admin" };
        copia[1].hash = calcularHash(copia[1]);
        // ...pero la 3 guardo el hash viejo de la 2
        const resultado = crearRegistroAuditoria().verificar(copia);
        assert.equal(resultado.valido, false);
        assert.equal(resultado.rotaEn, 3);
        assert.match(resultado.motivo, /no apunta/);
    });

    it("si se borra una entrada del medio, se detecta", () => {
        const copia = registroCon(4).exportar();
        copia.splice(1, 1);
        const resultado = crearRegistroAuditoria().verificar(copia);
        assert.equal(resultado.valido, false);
        assert.match(resultado.motivo, /se borro o se metio/);
    });
});

describe("buscar", () => {
    it("filtra por accion (y sub acciones), recurso y actor", () => {
        const r = crearRegistroAuditoria();
        r.anotar({ actor, accion: "citas.crear", recurso: { tipo: "cita", id: 1 } });
        r.anotar({ actor: { id: 2, nombre: "Kevin", rol: "tatuador" }, accion: "citas.reprogramar", recurso: { tipo: "cita", id: 1 } });
        r.anotar({ actor, accion: "citas.crear", recurso: { tipo: "cita", id: 2 } });

        assert.equal(r.buscar({ accion: "citas" }).length, 3);
        assert.equal(r.buscar({ recursoId: 1 }).length, 2);
        assert.equal(r.buscar({ actorId: 2 })[0].accion, "citas.reprogramar");
    });
});
