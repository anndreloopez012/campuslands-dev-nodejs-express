import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { campeonCrear, campeonEditar, campeonesQuery } from "../src/schemas/campeon.schema.js";
import { partidaCrear } from "../src/schemas/partida.schema.js";
import { idParams } from "../src/schemas/comunes.schema.js";
import { formatearIssues } from "../src/middlewares/validar.js";

// los schemas se prueban solos, sin servidor

const errores = (schema, datos) => formatearIssues(schema.safeParse(datos).error.issues);

describe("campeonCrear", () => {
    it("recorta, pone defaults y limpia etiquetas", () => {
        const r = campeonCrear.parse({ nombre: "  Zed ", rol: "mid", dificultad: 3, etiquetas: ["Asesino", "asesino", "MOVILIDAD"] });
        assert.deepEqual(r, { nombre: "Zed", rol: "mid", dificultad: 3, precio: 4800, etiquetas: ["asesino", "movilidad"] });
    });

    it("rechaza campos que no existen en el schema (ni id ni admin)", () => {
        assert.deepEqual(errores(campeonCrear, { nombre: "Zed", rol: "mid", dificultad: 1, id: 99, admin: true }), [
            { campo: "(raiz)", mensaje: "campos no permitidos: id, admin" }
        ]);
    });

    it("dice que falta y que esta mal en cada campo", () => {
        const lista = errores(campeonCrear, { nombre: "Z", rol: "support", dificultad: 4.5, precio: 100 });
        assert.deepEqual(lista.map((e) => e.campo), ["nombre", "rol", "dificultad", "precio"]);
        assert.equal(lista[1].mensaje, "rol debe ser uno de: top, jungla, mid, adc, soporte");
    });

    it("no convierte tipos en el body: '3' no es un numero", () => {
        assert.equal(campeonCrear.safeParse({ nombre: "Zed", rol: "mid", dificultad: "3" }).success, false);
    });
});

describe("campeonEditar", () => {
    it("acepta solo los campos que cambian y no pone defaults", () => {
        assert.deepEqual(campeonEditar.parse({ precio: 6300 }), { precio: 6300 });
    });

    it("pide al menos un campo", () => {
        assert.deepEqual(errores(campeonEditar, {}), [{ campo: "(raiz)", mensaje: "Manda al menos un campo para cambiar" }]);
    });

    it("usa las mismas reglas que crear", () => {
        assert.equal(campeonEditar.safeParse({ dificultad: 9 }).success, false);
    });
});

describe("query y params (llegan como texto)", () => {
    it("convierte page, limit e id a numero", () => {
        assert.deepEqual(campeonesQuery.parse({ page: "2", limit: "5", rol: "adc" }), { page: 2, limit: 5, rol: "adc" });
        assert.deepEqual(idParams.parse({ id: "7" }), { id: 7 });
    });

    it("pone page 1 y limit 10 si no vienen", () => {
        assert.deepEqual(campeonesQuery.parse({}), { page: 1, limit: 10 });
    });

    for (const id of ["abc", "0", "-4", "2.5"]) {
        it(`rechaza id "${id}"`, () => {
            assert.equal(idParams.safeParse({ id }).success, false);
        });
    }
});

// una partida valida para ir rompiendola en cada test
function partidaBuena() {
    const equipo = (nombre, ids, bans) => ({
        nombre,
        picks: ["top", "jungla", "mid", "adc", "soporte"].map((rol, i) => ({ jugador: `${nombre}${i}`, campeonId: ids[i], rol })),
        bans
    });
    return {
        torneo: "Copa Centroamerica",
        fecha: "2026-11-02T20:00:00Z",
        duracionMin: 32,
        ganador: "azul",
        azul: equipo("Quetzal", [1, 3, 5, 7, 9], [2]),
        rojo: equipo("Jaguar", [11, 4, 6, 8, 10], [12])
    };
}

describe("partidaCrear", () => {
    it("acepta una partida bien armada y pone bans [] si no vienen", () => {
        const p = partidaBuena();
        delete p.rojo.bans;
        assert.deepEqual(partidaCrear.parse(p).rojo.bans, []);
    });

    it("cada equipo tiene exactamente 5 picks", () => {
        const p = partidaBuena();
        p.azul.picks.pop();
        // con 4 picks ademas le falta un rol, salen los dos errores
        assert.deepEqual(errores(partidaCrear, p), [
            { campo: "azul.picks", mensaje: "cada equipo tiene exactamente 5 picks" },
            { campo: "azul.picks", mensaje: "al equipo azul le falta el rol soporte" }
        ]);
    });

    it("cada rol va una vez por equipo", () => {
        const p = partidaBuena();
        p.rojo.picks[1].rol = "top";
        assert.deepEqual(errores(partidaCrear, p), [{ campo: "rojo.picks", mensaje: "al equipo rojo le falta el rol jungla" }]);
    });

    it("un campeon no lo pueden elegir los dos equipos", () => {
        const p = partidaBuena();
        p.rojo.picks[2].campeonId = 5;
        assert.deepEqual(errores(partidaCrear, p), [{ campo: "rojo.picks[2].campeonId", mensaje: "el campeon 5 ya lo eligio el equipo azul" }]);
    });

    it("no se puede elegir un baneado, ni banear dos veces el mismo", () => {
        const p = partidaBuena();
        p.azul.picks[0].campeonId = 12; // lo baneo rojo
        p.rojo.bans = [12, 2, 2];
        assert.deepEqual(errores(partidaCrear, p), [
            { campo: "rojo.bans[2]", mensaje: "el campeon 2 esta baneado dos veces" },
            { campo: "azul.picks[0].campeonId", mensaje: "el campeon 12 esta baneado" }
        ]);
    });

    it("jugador repetido en el mismo equipo", () => {
        const p = partidaBuena();
        p.azul.picks[4].jugador = "quetzal0";
        assert.deepEqual(errores(partidaCrear, p), [{ campo: "azul.picks[4].jugador", mensaje: "quetzal0 esta repetido" }]);
    });

    it("un error de rango y uno de reglas salen juntos", () => {
        const p = partidaBuena();
        p.duracionMin = 5;
        p.rojo.picks[0].campeonId = 1;
        assert.deepEqual(errores(partidaCrear, p).map((e) => e.campo), ["duracionMin", "rojo.picks[0].campeonId"]);
    });

    // zod no corre superRefine si algun campo tiene el tipo o la opcion mal,
    // porque las reglas podrian recibir datos rotos. primero hay que arreglar la forma
    it("si hay un error de tipo u opcion, las reglas entre campos esperan", () => {
        const p = partidaBuena();
        p.ganador = "verde";
        p.rojo.picks[0].campeonId = 1;
        assert.deepEqual(errores(partidaCrear, p).map((e) => e.campo), ["ganador"]);
    });

    it("con un body vacio o tipos rotos no se cae, solo dice lo que falta", () => {
        assert.deepEqual(errores(partidaCrear, {}).map((e) => e.campo), ["torneo", "fecha", "duracionMin", "ganador", "azul", "rojo"]);
        assert.equal(partidaCrear.safeParse({ ...partidaBuena(), azul: { nombre: "X", picks: "muchos" } }).success, false);
    });

    it("la fecha tiene que ser ISO", () => {
        const p = partidaBuena();
        p.fecha = "02/11/2026";
        assert.equal(errores(partidaCrear, p)[0].mensaje, "fecha debe ser ISO, ej. 2026-11-02T20:00:00Z");
    });
});
