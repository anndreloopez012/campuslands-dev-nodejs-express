import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { appDePrueba } from "../test-helpers/app-de-prueba.js";

// supertest recibe la app y la levanta sola en un puerto libre

describe("GET /api/personajes", () => {
    it("200 con la lista y el total", async () => {
        const res = await request(appDePrueba()).get("/api/personajes");

        assert.equal(res.status, 200);
        assert.match(res.headers["content-type"], /application\/json/);
        assert.equal(res.body.ok, true);
        assert.equal(res.body.total, 2);
        assert.equal(res.body.data.length, 2);
    });

    it("filtra por ?clase=", async () => {
        const res = await request(appDePrueba()).get("/api/personajes").query({ clase: "mago" });

        assert.equal(res.status, 200);
        assert.deepEqual(res.body.data.map((p) => p.nombre), ["Lyra"]);
    });

    it("clase que existe pero sin personajes da lista vacia", async () => {
        const res = await request(appDePrueba()).get("/api/personajes?clase=clerigo");

        assert.equal(res.status, 200);
        assert.deepEqual(res.body.data, []);
    });

    it("400 con una clase que no existe", async () => {
        const res = await request(appDePrueba()).get("/api/personajes?clase=ninja");

        assert.equal(res.status, 400);
        assert.equal(res.body.ok, false);
        assert.match(res.body.message, /clase debe ser una de/);
    });
});

describe("GET /api/personajes/:id", () => {
    it("200 con el personaje", async () => {
        const res = await request(appDePrueba()).get("/api/personajes/1");

        assert.equal(res.status, 200);
        assert.equal(res.body.data.nombre, "Aldric");
    });

    it("404 si no existe", async () => {
        const res = await request(appDePrueba()).get("/api/personajes/99");

        assert.equal(res.status, 404);
        assert.equal(res.body.message, "No existe el personaje con id 99");
    });

    // varios ids malos en un solo bloque
    for (const id of ["abc", "0", "-3", "1.5"]) {
        it(`400 con id "${id}"`, async () => {
            const res = await request(appDePrueba()).get(`/api/personajes/${id}`);
            assert.equal(res.status, 400);
        });
    }
});

describe("rutas que no existen", () => {
    it("404 con el metodo y la ruta en el mensaje", async () => {
        const res = await request(appDePrueba()).put("/api/personajes/1");

        assert.equal(res.status, 404);
        assert.equal(res.body.message, "La ruta PUT /api/personajes/1 no existe");
    });

    it("GET /health responde", async () => {
        const res = await request(appDePrueba()).get("/health");
        assert.equal(res.status, 200);
        assert.equal(res.body.topic, "testing de rutas");
    });
});
