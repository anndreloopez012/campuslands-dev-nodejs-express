import { beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import request from "supertest";
import { crearApp } from "../src/app.js";
import { crearAlmacen } from "../src/datos/almacen.js";
import { cargarFixture } from "../src/datos/cargarFixture.js";
import { crearFabricas } from "../src/fabricas/index.js";
import { marcadorValido, nuevoElo } from "../src/servicios/torneo.js";
import { sembrar } from "../src/semilla.js";

const FIXTURE_FINAL = path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures", "final-torneo.json");

describe("reglas sueltas", () => {
    it("marcadores posibles e imposibles", () => {
        assert.deepEqual([[13, 0], [13, 11], [7, 13], [14, 12], [17, 15]].map(([a, b]) => marcadorValido(a, b)), [true, true, true, true, true]);
        assert.deepEqual([[13, 12], [12, 10], [15, 12], [14, 13], [13, 13], [-1, 13]].map(([a, b]) => marcadorValido(a, b)), [false, false, false, false, false, false]);
    });

    it("elo: con elos iguales se mueven 16 puntos", () => {
        assert.deepEqual(nuevoElo(1500, 1500, true), { a: 1516, b: 1484, cambio: 16 });
    });
});

// ---- con FIXTURE: escenario exacto escrito a mano ----
describe("con el fixture de la final", () => {
    let app;
    beforeEach(async () => {
        const almacen = crearAlmacen();
        await cargarFixture(almacen, FIXTURE_FINAL);
        app = crearApp({ almacen });
    });

    it("el ranking sale como en el fixture", async () => {
        const { body } = await request(app).get("/api/ranking");
        assert.deepEqual(body.data.map((e) => [e.puesto, e.nombre, e.elo]), [[1, "Team Fenix", 1720], [2, "Clan Sombra", 1580]]);
    });

    it("K/D del jugador nyx (24 kills / 12 muertes)", async () => {
        const { body } = await request(app).get("/api/jugadores/1/estadisticas");
        assert.deepEqual(body.data, { jugador: "nyx", partidas: 1, kills: 24, muertes: 12, kd: 2 });
    });

    it("si gana el no favorito, el elo se mueve mucho (y el ranking puede cambiar)", async () => {
        const res = await request(app).post("/api/partidas").send({ equipoA: 1, equipoB: 2, mapa: "Bind", rondasA: 11, rondasB: 13 });
        assert.equal(res.status, 201);
        assert.equal(res.body.data.cambioElo, 22);
        const ranking = (await request(app).get("/api/ranking")).body.data;
        assert.deepEqual(ranking.map((e) => e.elo), [1698, 1602]);
    });

    it("un jugador de otro equipo no puede salir en las estadisticas", async () => {
        const almacen = crearAlmacen();
        await cargarFixture(almacen, FIXTURE_FINAL);
        almacen.insertar("equipos", { nombre: "Otro", pais: "CO", elo: 1500, victorias: 0, derrotas: 0 });
        const intruso = almacen.insertar("jugadores", { alias: "intruso", rol: "duelista", edad: 20, equipoId: 3 });
        const res = await request(crearApp({ almacen })).post("/api/partidas").send({ equipoA: 1, equipoB: 2, mapa: "Bind", rondasA: 13, rondasB: 5, estadisticas: [{ jugadorId: intruso.id, kills: 1, muertes: 1 }] });
        assert.equal(res.status, 400);
        assert.match(res.body.errors[0], /no juega en esta partida/);
    });
});

// ---- con FACTORIES: cada test arma solo lo que necesita ----
describe("con factories", () => {
    let almacen;
    let f;
    let app;
    beforeEach(() => {
        almacen = crearAlmacen();
        f = crearFabricas(almacen);
        app = crearApp({ almacen });
    });

    it("registrar una partida valida actualiza victorias y derrotas", async () => {
        const body = f.partidaBody({ rondasA: 13, rondasB: 4 });
        const res = await request(app).post("/api/partidas").send(body);
        assert.equal(res.status, 201);
        assert.deepEqual([almacen.buscar("equipos", body.equipoA).victorias, almacen.buscar("equipos", body.equipoB).derrotas], [1, 1]);
    });

    it("400 con marcador imposible, mapa raro o el mismo equipo dos veces", async () => {
        const e = f.equipo.create();
        const res = await request(app).post("/api/partidas").send(f.partidaBody({ equipoA: e.id, equipoB: e.id, mapa: "Dust", rondasA: 13, rondasB: 12 }));
        assert.equal(res.status, 400);
        assert.equal(res.body.errors.length, 3);
    });

    it("el ranking ordena por elo y desempata por victorias y nombre", async () => {
        f.equipo.create({ nombre: "Bravo", elo: 1600, victorias: 2 });
        f.equipo.create({ nombre: "Alfa", elo: 1600, victorias: 2 });
        f.equipo.create({ nombre: "Charlie", elo: 1600, victorias: 5 });
        f.equipo.create({}, "favorito");
        const nombres = (await request(app).get("/api/ranking")).body.data.map((e) => e.nombre);
        assert.deepEqual(nombres.slice(1), ["Charlie", "Alfa", "Bravo"]);
    });

    it("equipo con sus jugadores", async () => {
        const e = f.equipoCompleto();
        const res = await request(app).get(`/api/equipos/${e.id}`);
        assert.equal(res.body.data.jugadores.length, 5);
    });

    it("K/D de un jugador sin muertes no divide entre 0", async () => {
        const e1 = f.equipoCompleto();
        const e2 = f.equipoCompleto();
        const estrella = e1.jugadores[0];
        await request(app).post("/api/partidas").send(f.partidaBody({ equipoA: e1.id, equipoB: e2.id, estadisticas: [{ jugadorId: estrella.id, kills: 30, muertes: 0 }] }));
        assert.equal((await request(app).get(`/api/jugadores/${estrella.id}/estadisticas`)).body.data.kd, 30);
    });
});

describe("semilla de desarrollo", () => {
    it("con la misma semilla el ranking sale identico", () => {
        const ranking = () => {
            const almacen = crearAlmacen();
            sembrar(almacen, { semilla: 99 });
            return almacen.listar("equipos").map((e) => [e.nombre, e.elo]);
        };
        assert.deepEqual(ranking(), ranking());
    });
});
