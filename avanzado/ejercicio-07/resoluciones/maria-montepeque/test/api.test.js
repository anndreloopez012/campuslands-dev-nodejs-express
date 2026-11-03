import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { crearApp } from "../src/app.js";

let app;
beforeEach(() => {
    app = crearApp({ demoraMs: 40 });
});

const llamadas = () => app.locals.catalogo.llamadas();

describe("cache delante del catalogo", () => {
    it("MISS lento la primera vez, HIT rapido la segunda", async () => {
        let inicio = Date.now();
        const primera = await request(app).get("/api/autos/3");
        const lenta = Date.now() - inicio;

        inicio = Date.now();
        const segunda = await request(app).get("/api/autos/3");
        const rapida = Date.now() - inicio;

        assert.equal(primera.headers["x-cache"], "MISS");
        assert.equal(segunda.headers["x-cache"], "HIT");
        assert.deepEqual(segunda.body, primera.body);
        assert.ok(lenta >= 35, `la primera tardo ${lenta}ms`);
        assert.ok(rapida < lenta);
        assert.equal(llamadas().buscar, 1);
    });

    it("la lista se cachea por filtro sin importar mayusculas", async () => {
        await request(app).get("/api/autos?marca=porsche");
        const otra = await request(app).get("/api/autos?marca=PORSCHE");

        assert.equal(otra.headers["x-cache"], "HIT");
        assert.equal(otra.body.data.length, 2);
        assert.equal(llamadas().listar, 1);
    });

    it("20 pedidos al mismo tiempo van una sola vez al catalogo", async () => {
        await Promise.all(Array.from({ length: 20 }, () => request(app).get("/api/autos/1")));
        assert.equal(llamadas().buscar, 1);
    });

    it("cambiar el precio invalida el auto y las listas (no se ve el precio viejo)", async () => {
        await request(app).get("/api/autos/3");
        await request(app).get("/api/autos");
        await request(app).get("/api/autos/5");

        const cambio = await request(app).patch("/api/autos/3/precio").send({ precioUsd: 199_000 });
        assert.equal(cambio.status, 200);

        const auto = await request(app).get("/api/autos/3");
        assert.equal(auto.headers["x-cache"], "MISS");
        assert.equal(auto.body.data.precioUsd, 199_000);

        const lista = await request(app).get("/api/autos");
        assert.equal(lista.headers["x-cache"], "MISS");
        assert.equal(lista.body.data.find((a) => a.id === 3).precioUsd, 199_000);

        // el auto 5 no cambio, sigue en cache
        assert.equal((await request(app).get("/api/autos/5")).headers["x-cache"], "HIT");
    });

    it("un auto que no existe da 404 y no se guarda en cache", async () => {
        assert.equal((await request(app).get("/api/autos/99")).status, 404);
        assert.equal((await request(app).get("/api/autos/99")).status, 404);
        assert.equal(llamadas().buscar, 2);
    });

    it("GET /api/cache muestra estadisticas y DELETE la limpia", async () => {
        await request(app).get("/api/autos/1");
        await request(app).get("/api/autos/1");

        const stats = (await request(app).get("/api/cache")).body.data;
        assert.equal(stats.hits, 1);
        assert.equal(stats.tasaAcierto, 50);
        assert.deepEqual(stats.claves, ["autos:1"]);

        assert.equal((await request(app).delete("/api/cache")).status, 204);
        assert.equal((await request(app).get("/api/autos/1")).headers["x-cache"], "MISS");
    });

    it("400 con id o precio invalidos", async () => {
        assert.equal((await request(app).get("/api/autos/abc")).status, 400);
        assert.equal((await request(app).patch("/api/autos/1/precio").send({ precioUsd: "mucho" })).status, 400);
        assert.equal((await request(app).patch("/api/autos/99/precio").send({ precioUsd: 5000 })).status, 404);
    });
});
