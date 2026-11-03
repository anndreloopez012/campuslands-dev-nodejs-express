import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";
import { resetDb } from "../src/data/db.js";

beforeEach(() => resetDb());

describe("el middleware validar en las rutas", () => {
    it("GET /api/campeones convierte la query y pagina", async () => {
        const res = await request(app).get("/api/campeones?rol=adc&limit=2");

        assert.equal(res.status, 200);
        assert.deepEqual(res.body.meta, { page: 1, limit: 2, total: 3 });
        assert.deepEqual(res.body.data.map((c) => c.nombre), ["Jinx", "Ashe"]);
    });

    it("query invalida: 400 diciendo que vino de la query", async () => {
        const res = await request(app).get("/api/campeones?rol=support&limit=100&color=rojo");

        assert.equal(res.status, 400);
        assert.deepEqual(res.body.errors, [
            { donde: "query", campo: "rol", mensaje: "rol debe ser uno de: top, jungla, mid, adc, soporte" },
            { donde: "query", campo: "limit", mensaje: "limit no puede pasar de 50" },
            { donde: "query", campo: "(raiz)", mensaje: "campos no permitidos: color" }
        ]);
    });

    it("params invalido: 400 diciendo que vino de params", async () => {
        const res = await request(app).get("/api/campeones/abc");

        assert.equal(res.status, 400);
        assert.equal(res.body.errors[0].donde, "params");
        assert.equal(res.body.errors[0].campo, "id");
    });

    it("PATCH junta errores de params y body", async () => {
        const res = await request(app).patch("/api/campeones/0").send({ dificultad: 7 });

        assert.deepEqual(res.body.errors.map((e) => `${e.donde}.${e.campo}`), ["params.id", "body.dificultad"]);
    });

    it("POST guarda lo que devolvio el schema (recortado y con defaults)", async () => {
        const res = await request(app).post("/api/campeones").send({ nombre: " Zed ", rol: "mid", dificultad: 3, etiquetas: ["Asesino"] });

        assert.equal(res.status, 201);
        assert.equal(res.headers.location, "/api/campeones/13");
        assert.deepEqual(res.body.data, { id: 13, nombre: "Zed", rol: "mid", dificultad: 3, precio: 4800, etiquetas: ["asesino"] });
    });

    it("no se puede colar el id ni otros campos", async () => {
        const res = await request(app).post("/api/campeones").send({ nombre: "Zed", rol: "mid", dificultad: 3, id: 1 });
        assert.equal(res.status, 400);
        assert.equal((await request(app).get("/api/campeones/1")).body.data.nombre, "Garen");
    });

    it("POST sin body da los campos obligatorios que faltan", async () => {
        const res = await request(app).post("/api/campeones");
        assert.deepEqual(res.body.errors.map((e) => e.campo), ["nombre", "rol", "dificultad"]);
    });

    it("PATCH cambia solo lo que se manda", async () => {
        const res = await request(app).patch("/api/campeones/5").send({ precio: 4800 });
        assert.deepEqual(res.body.data, { id: 5, nombre: "Ahri", rol: "mid", dificultad: 2, precio: 4800, etiquetas: ["mago", "movilidad"] });
    });

    it("lo que el schema no puede saber lo revisa el service: 409 y 404", async () => {
        assert.equal((await request(app).post("/api/campeones").send({ nombre: "ahri", rol: "mid", dificultad: 2 })).status, 409);
        assert.equal((await request(app).patch("/api/campeones/99").send({ precio: 900 })).status, 404);
    });
});

describe("partidas", () => {
    const equipo = (nombre, ids, bans = []) => ({
        nombre,
        picks: ["top", "jungla", "mid", "adc", "soporte"].map((rol, i) => ({ jugador: `${nombre}${i}`, campeonId: ids[i], rol })),
        bans
    });
    const partida = (azulIds, rojoIds) => ({
        torneo: "Copa",
        fecha: "2026-11-02T20:00:00Z",
        duracionMin: 30,
        ganador: "rojo",
        azul: equipo("Quetzal", azulIds, [2]),
        rojo: equipo("Jaguar", rojoIds, [12])
    });

    it("registra una partida valida", async () => {
        const res = await request(app).post("/api/partidas").send(partida([1, 3, 5, 7, 9], [11, 4, 6, 8, 10]));

        assert.equal(res.status, 201);
        assert.equal(res.headers.location, "/api/partidas/1");
        assert.equal((await request(app).get("/api/partidas/1")).body.data.ganador, "rojo");
    });

    it("400 con el campo exacto del problema", async () => {
        const res = await request(app).post("/api/partidas").send(partida([1, 3, 5, 7, 9], [1, 4, 6, 8, 10]));

        assert.equal(res.status, 400);
        assert.deepEqual(res.body.errors, [{ donde: "body", campo: "rojo.picks[0].campeonId", mensaje: "el campeon 1 ya lo eligio el equipo azul" }]);
    });

    it("422 si la forma esta bien pero el campeon no existe", async () => {
        const res = await request(app).post("/api/partidas").send(partida([1, 3, 5, 7, 99], [11, 4, 6, 8, 10]));

        assert.equal(res.status, 422);
        assert.equal(res.body.message, "No existen los campeones: 99");
    });
});

describe("schemas como JSON Schema", () => {
    it("GET /api/schemas lista los disponibles", async () => {
        const res = await request(app).get("/api/schemas");
        assert.ok(res.body.data.includes("/api/schemas/partida-crear"));
    });

    it("GET /api/schemas/campeon-crear sale del mismo schema que valida", async () => {
        const res = await request(app).get("/api/schemas/campeon-crear");

        assert.equal(res.status, 200);
        assert.equal(res.body.additionalProperties, false);
        assert.deepEqual(res.body.required, ["nombre", "rol", "dificultad"]);
        assert.deepEqual(res.body.properties.rol.enum, ["top", "jungla", "mid", "adc", "soporte"]);
        assert.equal(res.body.properties.precio.default, 4800);
    });

    it("404 si el schema no existe", async () => {
        assert.equal((await request(app).get("/api/schemas/nada")).status, 404);
    });
});
