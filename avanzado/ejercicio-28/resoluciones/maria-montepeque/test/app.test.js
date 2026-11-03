// la app se prueba SIN abrir puertos: supertest la llama directo
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { crearApp } from "../src/app.js";
import { zonaEn } from "../src/servicios/partidas.js";

describe("app (sin servidor)", () => {
    it("lista partidas y deja unirse", async () => {
        const app = crearApp();
        assert.equal((await request(app).get("/api/partidas")).body.data.length, 2);
        const res = await request(app).post("/api/partidas/1/jugadores").send({ alias: "ninja_gt" });
        assert.equal(res.status, 201);
        assert.equal(res.body.data.jugadores, 1);
    });

    it("409 si la partida esta llena, el alias se repite o ya empezo", async () => {
        const app = crearApp({ maxJugadores: 2 });
        await request(app).post("/api/partidas/1/jugadores").send({ alias: "uno" });
        assert.equal((await request(app).post("/api/partidas/1/jugadores").send({ alias: "uno" })).status, 409);
        await request(app).post("/api/partidas/1/jugadores").send({ alias: "dos" });
        assert.equal((await request(app).post("/api/partidas/1/jugadores").send({ alias: "tres" })).status, 409);
        await request(app).post("/api/partidas/1/iniciar");
        assert.match((await request(app).post("/api/partidas/2/iniciar")).body.message, /al menos 2/);
    });

    it("la zona avanza con el tiempo de la partida", async () => {
        let ahora = 0;
        const app = crearApp({ reloj: () => ahora });
        await request(app).post("/api/partidas/1/jugadores").send({ alias: "uno" });
        await request(app).post("/api/partidas/1/jugadores").send({ alias: "dos" });
        await request(app).post("/api/partidas/1/iniciar");
        ahora += 200_000; // 200 s -> fase 2
        const { body } = await request(app).get("/api/partidas/1/zona");
        assert.deepEqual([body.data.fase, body.data.radio, body.data.terminaEnSeg], [2, 1200, 130]);
    });

    it("zonaEn al final se queda en la ultima fase", () => {
        assert.equal(zonaEn(0).fase, 1);
        assert.equal(zonaEn(99_999).fase, 5);
    });

    it("si la bandera de apagado esta prendida: ready 503, live 200 y la API 503", async () => {
        const app = crearApp();
        app.locals.apagando = true;
        assert.equal((await request(app).get("/health/ready")).status, 503);
        assert.equal((await request(app).get("/health/live")).status, 200);
        const res = await request(app).get("/api/partidas");
        assert.equal(res.status, 503);
        assert.equal(res.headers.connection, "close");
    });
});
