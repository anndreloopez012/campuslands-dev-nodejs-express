import { describe, it } from "node:test";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import assert from "node:assert/strict";
import { DomainError, STATUS_BY_CODE } from "../src/errors.js";
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

const handle = (error) => {
  const response = fakeResponse();
  errorHandler(error, {}, response, () => {});
  return response;
};

describe("DomainError", () => {
  it("es un Error con nombre, codigo y mensaje", () => {
    const error = new DomainError("NOT_FOUND", "no existe");

    assert.ok(error instanceof Error);
    assert.equal(error.name, "DomainError");
    assert.equal(error.code, "NOT_FOUND");
    assert.equal(error.message, "no existe");
    assert.ok(error.stack.includes("no existe"));
  });
});

describe("errorHandler: errores de dominio", () => {
  it("cada codigo de dominio se traduce al estado HTTP esperado", () => {
    assert.deepEqual(STATUS_BY_CODE, {
      INVALID_INPUT: 400,
      INVALID_FORMULA: 400,
      UNKNOWN_ELEMENT: 400,
      INVALID_EQUATION: 400,
      NOT_FOUND: 404,
      DUPLICATE_NAME: 409,
    });
  });

  for (const [code, status] of Object.entries(STATUS_BY_CODE)) {
    it(`${code} -> ${status} y expone el codigo`, () => {
      const response = handle(new DomainError(code, "detalle"));

      assert.equal(response.statusCode, status);
      assert.deepEqual(response.body, { ok: false, code, message: "detalle" });
    });
  }

  it("un codigo sin traduccion se trata como error interno y no filtra su mensaje", (t) => {
    const log = t.mock.method(console, "error", () => {});
    const response = handle(new DomainError("MISTERIO", "detalle interno"));

    assert.equal(response.statusCode, 500);
    assert.deepEqual(response.body, { ok: false, message: "Error interno" });
    assert.equal(log.mock.callCount(), 1);
  });
});

describe("errorHandler: otros errores", () => {
  it("un error con status usa su codigo y su mensaje, sin exponer code", () => {
    const response = handle(Object.assign(new Error("conflicto"), { status: 409, code: "ALGO" }));

    assert.equal(response.statusCode, 409);
    assert.deepEqual(response.body, { ok: false, message: "conflicto" });
  });

  it("un JSON malformado responde 400 con mensaje propio", () => {
    const response = handle(Object.assign(new SyntaxError("Unexpected token"), { status: 400, type: "entity.parse.failed" }));

    assert.equal(response.statusCode, 400);
    assert.equal(response.body.message, "El cuerpo no es un JSON valido");
  });

  it("un error inesperado responde 500 generico, no filtra detalles y se registra", (t) => {
    const log = t.mock.method(console, "error", () => {});
    const failure = new Error("clave secreta: hunter2");
    const response = handle(failure);

    assert.equal(response.statusCode, 500);
    assert.deepEqual(response.body, { ok: false, message: "Error interno" });
    assert.deepEqual(log.mock.calls.map((call) => call.arguments[0]), [failure]);
  });
});

describe("contrato entre los servicios y el traductor de errores", () => {
  const servicesDir = fileURLToPath(new URL("../src/services/", import.meta.url));
  const usedCodes = new Set(
    readdirSync(servicesDir)
      .filter((file) => file.endsWith(".js"))
      .flatMap((file) => [...readFileSync(path.join(servicesDir, file), "utf8").matchAll(/new DomainError\(\s*"([A-Z_]+)"/g)].map((match) => match[1])),
  );

  it("encuentra los codigos que lanzan los servicios (la busqueda funciona)", () => {
    assert.ok(usedCodes.size >= 5, `solo se encontraron: ${[...usedCodes].join(", ")}`);
  });

  it("todo codigo que lanza un servicio tiene un estado HTTP asignado", () => {
    for (const code of usedCodes) assert.ok(code in STATUS_BY_CODE, `${code} no esta en STATUS_BY_CODE`);
  });

  it("todo codigo asignado lo lanza algun servicio (no hay traducciones muertas)", () => {
    for (const code of Object.keys(STATUS_BY_CODE)) assert.ok(usedCodes.has(code), `${code} no lo lanza ningun servicio`);
  });

  it("los estados asignados son errores del cliente (4xx)", () => {
    for (const status of Object.values(STATUS_BY_CODE)) assert.ok(status >= 400 && status < 500, String(status));
  });
});
