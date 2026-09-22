import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { createChampionsService } from "../src/services/champions.service.js";
import { errorHandler } from "../src/middlewares/error-handler.js";
import { startApp } from "../test-support/client.js";

let client;
beforeEach(async () => {
  client = await startApp(createApp({ champions: createChampionsService() }));
});
afterEach(() => client.close());

describe("GET /champions y /champions/:id", () => {
  it("200 con lista vacia al inicio y 201 al crear", async () => {
    assert.deepEqual((await client.request("GET", "/champions")).body.data, []);

    const created = await client.request("POST", "/champions", { json: { name: "Vex Umbrio", role: "adc", winRate: 50.4 } });
    assert.equal(created.status, 201);
    assert.equal(created.headers.get("location"), "/champions/1");
    assert.deepEqual((await client.request("GET", "/champions")).body.data, [created.body.data]);
    assert.deepEqual((await client.request("GET", "/champions/1")).body.data, created.body.data);
  });

  it("filtra por role via query string", async () => {
    await client.request("POST", "/champions", { json: { name: "Uno", role: "top", winRate: 50 } });
    await client.request("POST", "/champions", { json: { name: "Dos", role: "adc", winRate: 50 } });

    assert.equal((await client.request("GET", "/champions?role=top")).body.data.length, 1);
  });

  it("400 INVALID_QUERY con un role desconocido", async () => {
    assert.equal((await client.request("GET", "/champions?role=carry")).status, 400);
  });

  it("400 INVALID_BODY con un cuerpo invalido y no crea nada", async () => {
    const response = await client.request("POST", "/champions", { json: { name: "X" } });

    assert.equal(response.status, 400);
    assert.deepEqual((await client.request("GET", "/champions")).body.data, []);
  });

  it("404 NOT_FOUND con un id inexistente y 400 INVALID_ID con uno invalido", async () => {
    assert.equal((await client.request("GET", "/champions/99")).body.code, "NOT_FOUND");
    assert.equal((await client.request("GET", "/champions/abc")).body.code, "INVALID_ID");
  });
});

describe("rutas de documentacion", () => {
  it("GET /openapi.json expone un documento OpenAPI valido en JSON", async () => {
    const response = await client.request("GET", "/openapi.json");

    assert.equal(response.status, 200);
    assert.equal(response.body.openapi, "3.0.3");
    assert.ok(response.body.paths["/champions"]);
  });

  it("GET /docs sirve la interfaz de Swagger UI (HTML)", async () => {
    const response = await client.request("GET", "/docs/");

    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type"), /text\/html/);
    assert.match(response.text, /swagger-ui/i);
  });
});

describe("manejo de errores del middleware", () => {
  it("404 ROUTE_NOT_FOUND en una ruta que no existe", async () => {
    const response = await client.request("GET", "/nada");

    assert.equal(response.status, 404);
    assert.equal(response.body.code, "ROUTE_NOT_FOUND");
  });

  it("400 INVALID_JSON si el cuerpo no es JSON valido", async () => {
    const response = await client.request("POST", "/champions", { body: "{oops", headers: { "Content-Type": "application/json" } });

    assert.equal(response.status, 400);
    assert.equal(response.body.code, "INVALID_JSON");
  });

  it("un fallo interno inesperado responde 500 generico, no lo filtra y lo registra", async (t) => {
    const log = t.mock.method(console, "error", () => {});
    const failure = new Error("bug interno con datos sensibles");
    const broken = await startApp(createApp({ champions: { list: () => { throw failure; }, getById: () => {}, create: () => {} } }));

    try {
      const response = await broken.request("GET", "/champions");

      assert.equal(response.status, 500);
      assert.deepEqual(response.body, { ok: false, code: "INTERNAL_ERROR", message: "Error interno" });
      assert.deepEqual(log.mock.calls.map((call) => call.arguments[0]), [failure]);
    } finally {
      await broken.close();
    }
  });

  it("si la respuesta ya empezo a enviarse, el manejador delega en Express en vez de escribir otra", (t) => {
    const next = t.mock.fn();

    errorHandler(new Error("tarde"), {}, { headersSent: true }, next);

    assert.equal(next.mock.callCount(), 1);
  });
});
