import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { createDropsService } from "../src/services/drops.service.js";
import { errorHandler } from "../src/middlewares/error-handler.js";
import { startApp } from "../test-support/client.js";

let client;
beforeEach(async () => {
  client = await startApp(createApp({ drops: createDropsService() }));
});
afterEach(() => client.close());

describe("rutas de /drops", () => {
  it("201 al crear con Location, luego aparece en GET /drops y GET /drops/:id", async () => {
    const created = await client.request("POST", "/drops", { json: { zone: "Torre de Radio", lootTier: "epico" } });

    assert.equal(created.status, 201);
    assert.equal(created.headers.get("location"), "/drops/1");
    assert.deepEqual((await client.request("GET", "/drops")).body.data, [created.body.data]);
    assert.deepEqual((await client.request("GET", "/drops/1")).body.data, created.body.data);
  });

  it("PATCH /drops/:id/claim marca claimed y DELETE /drops/:id borra", async () => {
    await client.request("POST", "/drops", { json: { zone: "Zona A", lootTier: "raro" } });

    assert.equal((await client.request("PATCH", "/drops/1/claim")).body.data.claimed, true);
    assert.equal((await client.request("PATCH", "/drops/1/claim")).status, 409);

    const deleted = await client.request("DELETE", "/drops/1");
    assert.equal(deleted.status, 204);
    assert.equal(deleted.text, "");
    assert.equal((await client.request("GET", "/drops/1")).status, 404);
  });

  it("400/404 con ids invalidos o inexistentes", async () => {
    assert.equal((await client.request("GET", "/drops/abc")).body.code, "INVALID_ID");
    assert.equal((await client.request("GET", "/drops/99")).body.code, "NOT_FOUND");
  });
});

describe("manejo de errores del middleware", () => {
  it("404 ROUTE_NOT_FOUND en una ruta desconocida", async () => {
    const response = await client.request("GET", "/nada");

    assert.equal(response.status, 404);
    assert.equal(response.body.code, "ROUTE_NOT_FOUND");
  });

  it("400 INVALID_JSON si el cuerpo no es JSON valido", async () => {
    const response = await client.request("POST", "/drops", { body: "{oops", headers: { "Content-Type": "application/json" } });

    assert.equal(response.status, 400);
    assert.equal(response.body.code, "INVALID_JSON");
  });

  it("un fallo interno inesperado responde 500 generico, no lo filtra y lo registra", async (t) => {
    const log = t.mock.method(console, "error", () => {});
    const failure = new Error("bug interno con datos sensibles");
    const broken = await startApp(createApp({ drops: { list: () => { throw failure; }, getById() {}, create() {}, claim() {}, remove() {} } }));

    try {
      const response = await broken.request("GET", "/drops");

      assert.equal(response.status, 500);
      assert.deepEqual(response.body, { ok: false, code: "INTERNAL_ERROR", message: "Error interno" });
      assert.deepEqual(log.mock.calls.map((call) => call.arguments[0]), [failure]);
    } finally {
      await broken.close();
    }
  });

  it("si la respuesta ya empezo a enviarse, el manejador delega en Express", (t) => {
    const next = t.mock.fn();

    errorHandler(new Error("tarde"), {}, { headersSent: true }, next);

    assert.equal(next.mock.callCount(), 1);
  });
});
