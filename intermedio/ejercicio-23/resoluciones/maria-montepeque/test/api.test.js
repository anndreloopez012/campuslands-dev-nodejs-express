import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import app from "../src/app.js";
import { resetDb } from "../src/data/db.js";

// tests de integracion: levanto la app de verdad y le hago peticiones con fetch

let server;
let baseUrl;

// helper para no repetir fetch + json en cada test
async function pedir(metodo, ruta, body) {
    const opciones = { method: metodo, headers: {} };
    if (body !== undefined) {
        opciones.headers["Content-Type"] = "application/json";
        opciones.body = typeof body === "string" ? body : JSON.stringify(body);
    }

    const respuesta = await fetch(`${baseUrl}${ruta}`, opciones);
    return { status: respuesta.status, body: await respuesta.json() };
}

describe("API del taller", () => {
    before(async () => {
        // puerto 0 = el sistema da uno libre, asi no choca con nada
        server = app.listen(0);
        await new Promise((resolve) => server.once("listening", resolve));
        baseUrl = `http://localhost:${server.address().port}`;
    });

    after(() => {
        server.close();
    });

    beforeEach(() => {
        resetDb();
    });

    it("GET /health responde ok", async () => {
        const { status, body } = await pedir("GET", "/health");
        assert.equal(status, 200);
        assert.equal(body.topic, "testing con node test");
    });

    it("POST /api/cotizaciones calcula el costo", async () => {
        const { status, body } = await pedir("POST", "/api/cotizaciones", { proceso: "TIG", material: "aluminio", metros: 2 });

        assert.equal(status, 200);
        assert.equal(body.data.costo, 240);
    });

    it("POST /api/cotizaciones con aluminio y electrodo da 422", async () => {
        const { status, body } = await pedir("POST", "/api/cotizaciones", { proceso: "electrodo", material: "aluminio", metros: 2 });

        assert.equal(status, 422);
        assert.equal(body.ok, false);
    });

    it("POST /api/trabajos crea y despues se puede leer", async () => {
        const creado = await pedir("POST", "/api/trabajos", { cliente: "Metal Sur", proceso: "MIG", material: "acero", metros: 10 });
        assert.equal(creado.status, 201);
        assert.equal(creado.body.data.costo, 600);

        const leido = await pedir("GET", `/api/trabajos/${creado.body.data.id}`);
        assert.equal(leido.status, 200);
        assert.equal(leido.body.data.cliente, "Metal Sur");
    });

    it("POST /api/trabajos con datos malos da 400 con la lista de errores", async () => {
        const { status, body } = await pedir("POST", "/api/trabajos", { cliente: "X", proceso: "MIG", material: "acero", metros: "mucho" });

        assert.equal(status, 400);
        assert.ok(Array.isArray(body.errors));
    });

    it("JSON mal escrito da 400", async () => {
        const { status, body } = await pedir("POST", "/api/trabajos", "{malo");
        assert.equal(status, 400);
        assert.equal(body.message, "El body no es un JSON valido");
    });

    it("GET /api/trabajos?estado=pendiente filtra", async () => {
        const { body } = await pedir("GET", "/api/trabajos?estado=pendiente");
        assert.equal(body.total, 1);
    });

    it("GET /api/trabajos?estado=raro da 400", async () => {
        const { status } = await pedir("GET", "/api/trabajos?estado=raro");
        assert.equal(status, 400);
    });

    it("PATCH estado respeta las transiciones", async () => {
        const ok = await pedir("PATCH", "/api/trabajos/2/estado", { estado: "en_proceso" });
        assert.equal(ok.status, 200);

        const mal = await pedir("PATCH", "/api/trabajos/2/estado", { estado: "pendiente" });
        assert.equal(mal.status, 409);
    });

    it("GET /api/trabajos/abc da 400 y /99 da 404", async () => {
        assert.equal((await pedir("GET", "/api/trabajos/abc")).status, 400);
        assert.equal((await pedir("GET", "/api/trabajos/99")).status, 404);
    });

    it("ruta que no existe da 404", async () => {
        const { status } = await pedir("GET", "/api/nada");
        assert.equal(status, 404);
    });
});
