import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { errorHandler } from "../src/middlewares/error-handler.js";
import { startApp } from "../test-support/client.js";

describe("errorHandler (centralizado, no duplicado en cada ruta como en la version legacy)", () => {
  it("un fallo interno inesperado responde 500 generico, no lo filtra y lo registra", async (t) => {
    const log = t.mock.method(console, "error", () => {});
    const failure = new Error("bug interno con datos sensibles");
    const client = await startApp(createApp({ matches: { list: () => { throw failure; }, getById() {}, create() {}, start() {}, score() {}, finish() {} } }));

    try {
      const response = await client.request("GET", "/matches");

      assert.equal(response.status, 500);
      assert.deepEqual(response.body, { ok: false, code: "INTERNAL_ERROR", message: "Error interno" });
      assert.deepEqual(log.mock.calls.map((call) => call.arguments[0]), [failure]);
    } finally {
      await client.close();
    }
  });

  it("si la respuesta ya empezo a enviarse, delega en Express en vez de escribir otra", (t) => {
    const next = t.mock.fn();

    errorHandler(new Error("tarde"), {}, { headersSent: true }, next);

    assert.equal(next.mock.callCount(), 1);
  });
});
