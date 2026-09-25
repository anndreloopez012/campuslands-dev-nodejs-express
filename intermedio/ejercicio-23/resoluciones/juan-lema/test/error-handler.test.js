import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { errorHandler } from "../src/middlewares/error-handler.js";

function fakeResponse() {
  return {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

describe("errorHandler", () => {
  it("un error inesperado responde 500 generico, no filtra detalles internos y se registra", (t) => {
    const log = t.mock.method(console, "error", () => {});
    const response = fakeResponse();
    const failure = new Error("password de la base de datos: hunter2");

    errorHandler(failure, {}, response, () => {});

    assert.equal(response.statusCode, 500);
    assert.deepEqual(response.body, { ok: false, message: "Error interno" });
    assert.equal(log.mock.callCount(), 1);
    assert.equal(log.mock.calls[0].arguments[0], failure);
  });

  it("un error con status usa su codigo y su mensaje, y no se registra como fallo", (t) => {
    const log = t.mock.method(console, "error", () => {});
    const response = fakeResponse();

    errorHandler(Object.assign(new Error("No se puede pasar de pendiente a terminado"), { status: 409 }), {}, response, () => {});

    assert.equal(response.statusCode, 409);
    assert.deepEqual(response.body, { ok: false, message: "No se puede pasar de pendiente a terminado" });
    assert.equal(log.mock.callCount(), 0);
  });

  it("un JSON malformado (entity.parse.failed) responde 400 con un mensaje propio", () => {
    const response = fakeResponse();

    errorHandler(Object.assign(new SyntaxError("Unexpected token } in JSON at position 9"), { status: 400, type: "entity.parse.failed" }), {}, response, () => {});

    assert.equal(response.statusCode, 400);
    assert.deepEqual(response.body, { ok: false, message: "El cuerpo no es un JSON valido" });
  });
});
