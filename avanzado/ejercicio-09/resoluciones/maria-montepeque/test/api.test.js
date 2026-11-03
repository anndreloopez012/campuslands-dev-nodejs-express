import { describe, it } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import request from "supertest";
import { crearApp } from "../src/app.js";

describe("exportar con streams", () => {
    it("NDJSON: una pelea por linea, todas", async () => {
        const res = await request(crearApp({ totalPeleas: 300 })).get("/api/peleas.ndjson").buffer(true).parse((r, cb) => {
            let texto = "";
            r.on("data", (c) => (texto += c));
            r.on("end", () => cb(null, texto));
        });

        assert.equal(res.status, 200);
        assert.match(res.headers["content-type"], /application\/x-ndjson/);
        // no se manda el largo: se va mandando por pedazos
        assert.equal(res.headers["transfer-encoding"], "chunked");

        const lineas = res.body.trim().split("\n").map((l) => JSON.parse(l));
        assert.equal(lineas.length, 300);
        assert.equal(lineas[0].id, 1);
        assert.equal(lineas[299].id, 300);
    });

    it("CSV filtrado por categoria con encabezado", async () => {
        const res = await request(crearApp({ totalPeleas: 50 })).get("/api/peleas.csv?categoria=pesado");

        assert.match(res.headers["content-type"], /text\/csv/);
        assert.match(res.headers["content-disposition"], /peleas\.csv/);

        const filas = res.text.trim().split("\n");
        assert.equal(filas[0], "id,fecha,rojo,azul,categoria,resultado,round");
        assert.equal(filas.length, 1 + 10);
        assert.ok(filas.slice(1).every((f) => f.includes(",pesado,")));
    });

    it("categoria invalida da 400 antes de empezar a mandar", async () => {
        const res = await request(crearApp()).get("/api/peleas.ndjson?categoria=gigante");
        assert.equal(res.status, 400);
    });

    it("si el cliente corta la descarga, se deja de generar", async () => {
        const app = crearApp({ totalPeleas: 1_000_000 });
        const servidor = app.listen(0);
        await new Promise((r) => servidor.once("listening", r));

        await new Promise((resolve) => {
            http.get(`http://localhost:${servidor.address().port}/api/peleas.ndjson`, (res) => {
                // leo el primer pedazo y corto
                res.once("data", () => {
                    res.destroy();
                    resolve();
                });
            });
        });
        await new Promise((r) => setTimeout(r, 100));

        const estado = app.locals.ultimaExportacion;
        assert.equal(estado.cerrado, true);
        assert.ok(estado.generadas < 1_000_000, `genero ${estado.generadas}`);
        servidor.close();
    });
});

describe("subir golpes como stream", () => {
    const golpes = (n) => Array.from({ length: n }, (_, i) => JSON.stringify({ tipo: i % 2 ? "jab" : "patada", potencia: 100 + (i % 10) })).join("\n");

    it("procesa miles de lineas y devuelve el resumen", async () => {
        const res = await request(crearApp()).post("/api/golpes").set("Content-Type", "application/x-ndjson").send(golpes(20_000));

        assert.equal(res.status, 200);
        assert.equal(res.body.data.validos, 20_000);
        assert.deepEqual(res.body.data.porTipo, { patada: 10_000, jab: 10_000 });
        assert.equal(res.body.data.potenciaMax, 109);
    });

    it("cuenta las lineas invalidas con su numero", async () => {
        const res = await request(crearApp()).post("/api/golpes").send('{"tipo":"jab","potencia":200}\n{roto\n{"tipo":"jab","potencia":-5}');

        assert.equal(res.body.data.validos, 1);
        assert.deepEqual(res.body.data.primerosInvalidos, [
            { linea: 2, motivo: "JSON invalido" },
            { linea: 3, motivo: "tipo o potencia invalidos" }
        ]);
    });

    it("413 si el body pasa el limite", async () => {
        const res = await request(crearApp({ maxBytesSubida: 1000 })).post("/api/golpes").send(golpes(200));
        assert.equal(res.status, 413);
        assert.match(res.body.message, /maximo de 1000 bytes/);
    });
});
