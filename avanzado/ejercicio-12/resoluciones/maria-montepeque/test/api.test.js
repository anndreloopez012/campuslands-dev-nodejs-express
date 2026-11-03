import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { gunzipSync } from "node:zlib";
import http from "node:http";
import request from "supertest";
import { crearApp } from "../src/app.js";

// lee la respuesta cruda (para poder descomprimir el gzip a mano)
const crudo = (req) =>
    req.buffer(true).parse((res, cb) => {
        const pedazos = [];
        res.on("data", (c) => pedazos.push(c));
        res.on("end", () => cb(null, Buffer.concat(pedazos)));
    });

describe("GET /api/peliculas/exportar", () => {
    const app = crearApp({ copias: 200 });

    it("exporta las 2000 peliculas en un JSON valido con meta y total", async () => {
        const res = await crudo(request(app).get("/api/peliculas/exportar").set("Accept-Encoding", "identity"));
        const json = JSON.parse(res.body.toString());

        assert.equal(res.status, 200);
        assert.match(res.headers["content-disposition"], /attachment; filename="peliculas-\d{4}-\d{2}-\d{2}\.json"/);
        assert.equal(json.total, 2000);
        assert.equal(json.peliculas.length, 2000);
        assert.equal(json.meta.formato, "1.0");
    });

    it("nunca salen los campos privados y los tipos raros salen bien", async () => {
        const res = await crudo(request(app).get("/api/peliculas/exportar").set("Accept-Encoding", "identity"));
        const primera = JSON.parse(res.body.toString()).peliculas[0];

        assert.equal(primera.costoProduccionUsd, undefined);
        assert.equal(primera.notasInternas, undefined);
        assert.deepEqual(primera.etiquetas, ["miedo", "sobrenatural"]);
        assert.equal(primera.taquillaUsd, "1000000");
        assert.equal(primera.estreno, "2013-01-13T00:00:00.000Z");
    });

    it("?campos= elige que exportar (y el id va siempre)", async () => {
        const res = await crudo(request(app).get("/api/peliculas/exportar?campos=titulo,anio&subgenero=folk&desde=2019").set("Accept-Encoding", "identity"));
        const json = JSON.parse(res.body.toString());

        assert.deepEqual(Object.keys(json.peliculas[0]), ["id", "titulo", "anio"]);
        assert.ok(json.peliculas.every((p) => p.anio >= 2019));
        assert.deepEqual(json.meta.filtros, { subgenero: "folk", desde: 2019 });
    });

    it("pedir un campo privado da 400", async () => {
        const res = await request(app).get("/api/peliculas/exportar?campos=titulo,costoProduccionUsd");
        assert.equal(res.status, 400);
        assert.match(res.body.message, /costoProduccionUsd/);
    });

    it("con Accept-Encoding: gzip sale comprimido y pesa mucho menos", async () => {
        // supertest descomprime solo, asi que para ver los bytes reales uso http.get
        const servidor = app.listen(0);
        await new Promise((r) => servidor.once("listening", r));
        const bajar = (encoding) =>
            new Promise((resolve) => {
                http.get({ port: servidor.address().port, path: "/api/peliculas/exportar", headers: { "Accept-Encoding": encoding } }, (res) => {
                    const pedazos = [];
                    res.on("data", (c) => pedazos.push(c));
                    res.on("end", () => resolve({ headers: res.headers, body: Buffer.concat(pedazos) }));
                });
            });

        const normal = await bajar("identity");
        const comprimido = await bajar("gzip");
        servidor.close();

        assert.equal(comprimido.headers["content-encoding"], "gzip");
        const descomprimido = JSON.parse(gunzipSync(comprimido.body).toString());
        assert.equal(descomprimido.total, 2000);
        assert.ok(comprimido.body.length < normal.body.length / 5, `${comprimido.body.length} vs ${normal.body.length}`);
    });
});

describe("ETag y 304", () => {
    it("si los datos no cambiaron responde 304 sin cuerpo", async () => {
        const app = crearApp({ copias: 2 });
        const primera = await request(app).get("/api/peliculas/exportar");
        const etag = primera.headers.etag;

        const segunda = await request(app).get("/api/peliculas/exportar").set("If-None-Match", etag);
        assert.equal(segunda.status, 304);
        assert.equal(segunda.text, "");
    });

    it("otra seleccion de campos tiene otro ETag", async () => {
        const app = crearApp({ copias: 2 });
        const a = await request(app).get("/api/peliculas/exportar");
        const b = await request(app).get("/api/peliculas/exportar?campos=titulo");
        assert.notEqual(a.headers.etag, b.headers.etag);
    });

    it("despues de un cambio el ETag viejo ya no sirve", async () => {
        const app = crearApp({ copias: 2 });
        const etag = (await request(app).get("/api/peliculas/exportar")).headers.etag;

        const cambio = await request(app).patch("/api/peliculas/1/calificacion").send({ calificacion: 9.5 });
        assert.equal(cambio.status, 200);
        assert.equal(cambio.body.data.taquillaUsd, "1000000");

        const despues = await request(app).get("/api/peliculas/exportar").set("If-None-Match", etag);
        assert.equal(despues.status, 200);
        assert.notEqual(despues.headers.etag, etag);
    });

    it("400 y 404 al calificar", async () => {
        const app = crearApp({ copias: 1 });
        assert.equal((await request(app).patch("/api/peliculas/1/calificacion").send({ calificacion: 11 })).status, 400);
        assert.equal((await request(app).patch("/api/peliculas/999/calificacion").send({ calificacion: 5 })).status, 404);
    });
});
