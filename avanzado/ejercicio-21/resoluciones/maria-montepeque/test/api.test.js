import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { crearApp } from "../src/app.js";

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const renderizar = (app, escena, usuario) => request(app).post(`/api/escenas/${escena}/renders`).set("X-Usuario", usuario);

async function esperarListo(app, id) {
    for (let i = 0; i < 200; i++) {
        const t = (await request(app).get(`/api/renders/${id}`)).body.data;
        if (t.estado === "listo" || t.estado === "fallido") return t;
        await esperar(5);
    }
    throw new Error("el render nunca termino");
}

describe("renders con limite de concurrencia", () => {
    it("responde 202 con Location y el render termina solo", async () => {
        const app = crearApp({ msPorFrame: 0 });
        const res = await renderizar(app, 1, "lucia");
        assert.equal(res.status, 202);
        assert.equal(res.headers.location, "/api/renders/1");

        const final = await esperarListo(app, 1);
        assert.equal(final.estado, "listo");
        assert.equal(final.progreso, 100);
    });

    it("con max 2, nunca hay mas de 2 renders a la vez", async () => {
        const app = crearApp({ max: 2, maxCola: 10, msPorFrame: 0, maxPorUsuario: 10 });
        for (let i = 0; i < 6; i++) assert.equal((await renderizar(app, 1, `animador${i}`)).status, 202);

        const estado = (await request(app).get("/api/renders-estado")).body.data;
        assert.equal(estado.activos, 2);
        assert.equal(estado.enCola, 4);

        for (let i = 1; i <= 6; i++) await esperarListo(app, i);
        assert.equal((await request(app).get("/api/renders-estado")).body.data.pico, 2);
    });

    it("503 con Retry-After cuando la cola se llena", async () => {
        const app = crearApp({ max: 1, maxCola: 1, msPorFrame: 5, maxPorUsuario: 10 });
        await renderizar(app, 2, "a");
        await renderizar(app, 2, "b");
        const res = await renderizar(app, 2, "c");
        assert.equal(res.status, 503);
        assert.equal(res.headers["retry-after"], "5");
    });

    it("429 si un mismo animador ya tiene 2 pendientes (los demas si pueden)", async () => {
        const app = crearApp({ max: 1, maxCola: 10, msPorFrame: 5, maxPorUsuario: 2 });
        await renderizar(app, 2, "lucia");
        await renderizar(app, 2, "lucia");
        const tercero = await renderizar(app, 2, "lucia");
        assert.equal(tercero.status, 429);
        assert.equal(tercero.headers["retry-after"], "2");
        assert.equal((await renderizar(app, 2, "pedro")).status, 202);
    });
});

describe("escenas con bloqueo optimista", () => {
    it("GET da la version en el ETag y PATCH con esa version funciona", async () => {
        const app = crearApp();
        const ver = await request(app).get("/api/escenas/1");
        assert.equal(ver.headers.etag, '"1"');

        const res = await request(app).patch("/api/escenas/1").set("If-Match", ver.headers.etag).send({ frames: 60 });
        assert.equal(res.status, 200);
        assert.equal(res.body.data.version, 2);
        assert.equal(res.headers.etag, '"2"');
    });

    it("428 si no manda If-Match", async () => {
        const app = crearApp();
        assert.equal((await request(app).patch("/api/escenas/1").send({ frames: 60 })).status, 428);
    });

    it("dos animadores editan a la vez con la misma version: uno gana, el otro 412", async () => {
        const app = crearApp();
        const [a, b] = await Promise.all([
            request(app).patch("/api/escenas/1").set("If-Match", '"1"').send({ camara: "en mano" }),
            request(app).patch("/api/escenas/1").set("If-Match", '"1"').send({ iluminacion: "atardecer" })
        ]);

        assert.deepEqual([a.status, b.status].sort(), [200, 412]);
        const perdedor = a.status === 412 ? a : b;
        assert.equal(perdedor.body.versionActual, 2);

        // el cambio del que gano sigue ahi, no se piso
        const escena = (await request(app).get("/api/escenas/1")).body.data;
        assert.equal(escena.version, 2);
        assert.ok(escena.camara === "en mano" || escena.iluminacion === "atardecer");
        assert.ok(!(escena.camara === "en mano" && escena.iluminacion === "atardecer"));
    });

    it("400 si edita campos que no se pueden (y no sube la version)", async () => {
        const app = crearApp();
        const res = await request(app).patch("/api/escenas/1").set("If-Match", '"1"').send({ version: 99 });
        assert.equal(res.status, 400);
        assert.equal((await request(app).get("/api/escenas/1")).headers.etag, '"1"');
    });
});
