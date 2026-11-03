import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { crearApp } from "../src/app.js";

const isrc = (i) => `GTXYZ26${String(i).padStart(5, "0")}`;
const archivo = (n, desde = 0) =>
    Array.from({ length: n }, (_, i) => JSON.stringify({ isrc: isrc(desde + i), titulo: `Son ${desde + i}`, artista: "Marimba Nacional", genero: "marimba", anio: 2020, duracionSeg: 200 })).join("\n");

const subir = (app, cuerpo, query = "") => request(app).post(`/api/importaciones${query}`).set("Content-Type", "application/x-ndjson").send(cuerpo);

describe("POST /api/importaciones", () => {
    it("importa 5000 canciones y responde 201 con el reporte", async () => {
        const app = crearApp();
        const res = await subir(app, archivo(5000));

        assert.equal(res.status, 201);
        assert.equal(res.body.data.insertadas, 5000);
        assert.equal(res.body.data.lotes, 10);
        assert.equal(res.body.data.aplicado, true);
        assert.equal((await request(app).get("/api/canciones")).body.total, 5003);
    });

    it("simular responde 200 y no cambia el catalogo", async () => {
        const app = crearApp();
        const res = await subir(app, archivo(10), "?simular=true");

        assert.equal(res.status, 200);
        assert.equal(res.body.data.motivo, "simulacion: no se guardo nada");
        assert.equal((await request(app).get("/api/canciones")).body.total, 3);
    });

    it("upsert por query y el registro de importaciones", async () => {
        const app = crearApp();
        await subir(app, archivo(3));
        const segunda = await subir(app, archivo(5), "?modo=upsert");

        assert.deepEqual([segunda.body.data.actualizadas, segunda.body.data.insertadas], [3, 2]);

        const lista = (await request(app).get("/api/importaciones")).body.data;
        assert.deepEqual(lista.map((i) => [i.id, i.estado, i.opciones.modo]), [[1, "terminada", "insertar"], [2, "terminada", "upsert"]]);

        const detalle = (await request(app).get("/api/importaciones/2")).body.data;
        assert.equal(detalle.reporte.actualizadas, 3);
    });

    it("todoONada con un error responde 200, aplicado false y no guarda", async () => {
        const app = crearApp();
        const res = await subir(app, archivo(20) + '\n{"isrc":"malo"}', "?todoONada=true");

        assert.equal(res.status, 200);
        assert.equal(res.body.data.aplicado, false);
        assert.equal((await request(app).get("/api/canciones")).body.total, 3);
    });

    it("dos importaciones al mismo tiempo: la segunda da 409", async () => {
        const app = crearApp({ tamanoLote: 50 });
        const [a, b] = await Promise.all([subir(app, archivo(20_000)), subir(app, archivo(10, 50_000))]);

        assert.deepEqual([a.status, b.status].sort(), [201, 409]);
    });

    it("errores: modo invalido 400, no es ndjson 415, muy grande 413", async () => {
        const app = crearApp({ maxBytes: 2000 });
        assert.equal((await subir(app, archivo(1), "?modo=borrar")).status, 400);
        assert.equal((await subir(app, archivo(1), "?simular=si")).status, 400);
        assert.equal((await request(app).post("/api/importaciones").send({ a: 1 })).status, 415);

        const grande = await subir(app, archivo(100));
        assert.equal(grande.status, 413);
        const registro = (await request(app).get("/api/importaciones/1")).body.data;
        assert.equal(registro.estado, "fallida");
    });

    it("buscar lo importado", async () => {
        const app = crearApp();
        await subir(app, archivo(3));
        const res = await request(app).get(`/api/canciones/${isrc(1).toLowerCase()}`);
        assert.equal(res.body.data.titulo, "Son 1");
    });
});
