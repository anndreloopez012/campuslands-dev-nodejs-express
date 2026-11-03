import { describe, it } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import request from "supertest";
import { crearApp } from "../src/app.js";
import { cargarConfig } from "../src/config/cargar.js";

// usa los config/*.json reales del proyecto, pero sin leer el .env local
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const config = (env = {}) => cargarConfig({ env: { NODE_ENV: "test", ...env }, carpeta: RAIZ, usarArchivoEnv: false });

describe("la app usa la config", () => {
    it("config/test.json pone turnos de 2 segundos", async () => {
        const res = await request(crearApp(config())).post("/api/drafts");
        assert.equal(res.body.data.turnoActual.segundosRestantes, 2);
    });

    it("el orden del draft sale de bans y tamano de equipo", async () => {
        const app = crearApp(config({ DRAFT_BANS: "1", DRAFT_TAMANO_EQUIPO: "2" }));
        await request(app).post("/api/drafts");
        const pasos = [
            { equipo: "azul", tipo: "ban", heroe: "Aurora" },
            { equipo: "rojo", tipo: "ban", heroe: "Brakk" },
            { equipo: "azul", tipo: "pick", heroe: "Cyra" },
            { equipo: "rojo", tipo: "pick", heroe: "Draven" },
            { equipo: "azul", tipo: "pick", heroe: "Eldra" },
            { equipo: "rojo", tipo: "pick", heroe: "Fang" }
        ];
        let ultimo;
        for (const paso of pasos) {
            ultimo = await request(app).post("/api/drafts/1/acciones").send(paso);
            assert.equal(ultimo.status, 200, ultimo.body.message);
        }
        assert.equal(ultimo.body.data.terminado, true);
        assert.deepEqual(ultimo.body.data.azul, { bans: ["Aurora"], picks: ["Cyra", "Eldra"] });
    });

    it("409 si no es su turno o el heroe ya se uso", async () => {
        const app = crearApp(config());
        await request(app).post("/api/drafts");
        assert.equal((await request(app).post("/api/drafts/1/acciones").send({ equipo: "rojo", tipo: "ban", heroe: "Aurora" })).status, 409);
        await request(app).post("/api/drafts/1/acciones").send({ equipo: "azul", tipo: "ban", heroe: "Aurora" });
        assert.equal((await request(app).post("/api/drafts/1/acciones").send({ equipo: "rojo", tipo: "ban", heroe: "Aurora" })).status, 409);
    });

    it("se vence el turno segun DRAFT_TIEMPO_TURNO", async () => {
        let ahora = 1_000_000;
        const app = crearApp(config({ DRAFT_TIEMPO_TURNO: "5s" }), { reloj: () => ahora });
        await request(app).post("/api/drafts");
        ahora += 6000;
        const res = await request(app).post("/api/drafts/1/acciones").send({ equipo: "azul", tipo: "ban", heroe: "Aurora" });
        assert.equal(res.status, 409);
        assert.match(res.body.message, /5s/);
    });
});

describe("feature flags", () => {
    it("modo ranked apagado -> 404, prendido -> 200", async () => {
        assert.equal((await request(crearApp(config())).get("/api/ranked/temporada")).status, 404);
        const res = await request(crearApp(config({ FUNCION_RANKED: "true", REGION: "KR" }))).get("/api/ranked/temporada");
        assert.equal(res.status, 200);
        assert.equal(res.body.data.region, "KR");
    });

    it("heroes nuevos solo aparecen con la funcion prendida", async () => {
        assert.equal((await request(crearApp(config())).get("/api/heroes")).body.data.includes("Quill"), false);
        assert.equal((await request(crearApp(config({ FUNCION_HEROES_NUEVOS: "1" }))).get("/api/heroes")).body.data.includes("Quill"), true);
    });
});

describe("/api/config", () => {
    it("muestra la config sin secretos en test y no existe en production", async () => {
        const res = await request(crearApp(config())).get("/api/config");
        assert.equal(res.body.data.secretos.jwtSecreto, "[configurado]");

        const prod = cargarConfig({ env: { NODE_ENV: "production", URL_BASE: "https://api.moba.gg", API_KEY_ESTADISTICAS: "llave-de-produccion-123456", JWT_SECRETO: "z".repeat(40) }, carpeta: RAIZ, usarArchivoEnv: false });
        assert.equal((await request(crearApp(prod)).get("/api/config")).status, 404);
        // config/production.json prende ranked
        assert.equal(prod.funciones.modoRanked, true);
    });
});
