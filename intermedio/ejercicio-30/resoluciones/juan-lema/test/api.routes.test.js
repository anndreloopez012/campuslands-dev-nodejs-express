import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { errorHandler } from "../src/middlewares/error-handler.js";
import { startApp } from "../test-support/client.js";

let client;
beforeEach(async () => {
  client = await startApp(createApp({ jwtSecret: "clave-de-pruebas" }));
});
afterEach(() => client.close());

describe("GET /health", () => {
  it("responde ok sin necesitar token", async () => {
    const response = await client.request("GET", "/health");

    assert.equal(response.status, 200);
    assert.equal(response.body.ok, true);
  });
});

describe("POST /auth/login y GET /auth/me", () => {
  it("entrega token y datos del usuario por cada rol sembrado", async () => {
    for (const [username, password, role] of [["recepcion", "demo123", "recepcionista"], ["mecanico", "demo456", "mecanico"], ["jefe", "demo789", "admin"]]) {
      const login = await client.request("POST", "/auth/login", { json: { username, password } });

      assert.equal(login.status, 200);
      assert.equal(login.body.data.user.role, role);

      const me = await client.request("GET", "/auth/me", { token: login.body.data.token });
      assert.equal(me.status, 200);
      assert.equal(me.body.data.role, role);
      assert.ok(Array.isArray(me.body.data.permissions) && me.body.data.permissions.length > 0);
    }
  });

  it("401 INVALID_CREDENTIALS con password incorrecta", async () => {
    const response = await client.request("POST", "/auth/login", { json: { username: "recepcion", password: "mala" } });

    assert.equal(response.status, 401);
    assert.equal(response.body.code, "INVALID_CREDENTIALS");
  });

  it("400 INVALID_BODY si falta username o password", async () => {
    assert.equal((await client.request("POST", "/auth/login", { json: { username: "recepcion" } })).status, 400);
  });

  it("401 MISSING_TOKEN sin header Authorization, con WWW-Authenticate", async () => {
    const response = await client.request("GET", "/auth/me");

    assert.equal(response.status, 401);
    assert.equal(response.body.code, "MISSING_TOKEN");
    assert.equal(response.headers.get("www-authenticate"), "Bearer");
  });

  it("401 INVALID_TOKEN con un token que no existe, con el desafio invalid_token", async () => {
    const response = await client.request("GET", "/auth/me", { token: "token.falso.aqui" });

    assert.equal(response.status, 401);
    assert.equal(response.body.code, "INVALID_TOKEN");
    assert.equal(response.headers.get("www-authenticate"), 'Bearer error="invalid_token"');
  });
});

describe("permisos: matriz completa por rol", () => {
  const cases = [
    ["GET", "/motorcycles", null, { recepcionista: 200, mecanico: 200, admin: 200 }],
    ["POST", "/motorcycles", { plate: "NEW1234", brand: "Suzuki", model: "GSX", ownerName: "Ana Ruiz" }, { recepcionista: 201, mecanico: 403, admin: 201 }],
    ["GET", "/work-orders", null, { recepcionista: 200, mecanico: 200, admin: 200 }],
  ];

  for (const [method, path, json, expected] of cases) {
    for (const [role, status] of Object.entries(expected)) {
      it(`${method} ${path} como ${role} -> ${status}`, async () => {
        const username = { recepcionista: "recepcion", mecanico: "mecanico", admin: "jefe" }[role];
        const token = await client.loginAs(username);
        const response = await client.request(method, path, json ? { token, json } : { token });

        assert.equal(response.status, status);
        if (status === 403) assert.equal(response.body.code, "FORBIDDEN");
      });
    }
  }
});

describe("GET /motorcycles y GET /motorcycles/:id", () => {
  it("lista las motos sembradas y permite consultar una por id", async () => {
    const token = await client.loginAs("recepcion");
    const list = await client.request("GET", "/motorcycles", { token });

    assert.equal(list.status, 200);
    assert.equal(list.body.data.length, 2);

    const fetched = await client.request("GET", `/motorcycles/${list.body.data[0].id}`, { token });
    assert.deepEqual(fetched.body.data, list.body.data[0]);
  });

  it("400/404 con ids invalidos o inexistentes", async () => {
    const token = await client.loginAs("recepcion");

    assert.equal((await client.request("GET", "/motorcycles/abc", { token })).body.code, "INVALID_ID");
    assert.equal((await client.request("GET", "/motorcycles/999", { token })).body.code, "NOT_FOUND");
  });
});

describe("POST /motorcycles", () => {
  it("201 con Location, y 409 si la placa ya existe", async () => {
    const token = await client.loginAs("recepcion");
    const created = await client.request("POST", "/motorcycles", { token, json: { plate: "NEW1234", brand: "Suzuki", model: "GSX", ownerName: "Ana Ruiz" } });

    assert.equal(created.status, 201);
    assert.equal(created.headers.get("location"), `/motorcycles/${created.body.data.id}`);

    const duplicate = await client.request("POST", "/motorcycles", { token, json: { plate: "new1234", brand: "Suzuki", model: "GSX", ownerName: "Ana Ruiz" } });
    assert.equal(duplicate.status, 409);
    assert.equal(duplicate.body.code, "PLATE_TAKEN");
  });

  it("400 INVALID_BODY con un cuerpo invalido", async () => {
    const token = await client.loginAs("recepcion");
    const response = await client.request("POST", "/motorcycles", { token, json: { plate: "x" } });

    assert.equal(response.status, 400);
  });
});

describe("flujo completo de una orden de trabajo", () => {
  it("recepcion crea la orden, mecanico la hace avanzar hasta entregada", async () => {
    const recepcionToken = await client.loginAs("recepcion");
    const mecanicoToken = await client.loginAs("mecanico");

    const motorcycle = (await client.request("GET", "/motorcycles", { token: recepcionToken })).body.data[0];
    const created = await client.request("POST", "/work-orders", { token: recepcionToken, json: { motorcycleId: motorcycle.id, description: "Cambio de aceite y revision de frenos" } });

    assert.equal(created.status, 201);
    assert.equal(created.body.data.status, "recibida");

    const id = created.body.data.id;
    for (const status of ["en_diagnostico", "en_reparacion", "lista", "entregada"]) {
      const advanced = await client.request("PATCH", `/work-orders/${id}/status`, { token: mecanicoToken, json: { status } });

      assert.equal(advanced.status, 200);
      assert.equal(advanced.body.data.status, status);
    }

    assert.equal((await client.request("GET", `/work-orders/${id}`, { token: recepcionToken })).body.data.mechanic, "mecanico");
  });

  it("recepcionista no puede avanzar el estado de una orden (403)", async () => {
    const recepcionToken = await client.loginAs("recepcion");
    const motorcycle = (await client.request("GET", "/motorcycles", { token: recepcionToken })).body.data[0];
    const created = await client.request("POST", "/work-orders", { token: recepcionToken, json: { motorcycleId: motorcycle.id, description: "Cambio de aceite y revision de frenos" } });

    const response = await client.request("PATCH", `/work-orders/${created.body.data.id}/status`, { token: recepcionToken, json: { status: "en_diagnostico" } });
    assert.equal(response.status, 403);
  });

  it("mecanico no puede crear ordenes de trabajo (403)", async () => {
    const mecanicoToken = await client.loginAs("mecanico");
    const response = await client.request("POST", "/work-orders", { token: mecanicoToken, json: { motorcycleId: 1, description: "Cambio de aceite y revision" } });

    assert.equal(response.status, 403);
  });

  it("409 INVALID_TRANSITION al saltarse un estado", async () => {
    const recepcionToken = await client.loginAs("recepcion");
    const mecanicoToken = await client.loginAs("mecanico");
    const created = await client.request("POST", "/work-orders", { token: recepcionToken, json: { motorcycleId: 1, description: "Cambio de aceite y revision" } });

    const response = await client.request("PATCH", `/work-orders/${created.body.data.id}/status`, { token: mecanicoToken, json: { status: "en_reparacion" } });
    assert.equal(response.status, 409);
    assert.equal(response.body.code, "INVALID_TRANSITION");
  });

  it("solo admin puede borrar una orden (DELETE), mecanico y recepcion reciben 403", async () => {
    const recepcionToken = await client.loginAs("recepcion");
    const mecanicoToken = await client.loginAs("mecanico");
    const jefeToken = await client.loginAs("jefe");
    const created = await client.request("POST", "/work-orders", { token: recepcionToken, json: { motorcycleId: 1, description: "Cambio de aceite y revision" } });
    const id = created.body.data.id;

    assert.equal((await client.request("DELETE", `/work-orders/${id}`, { token: recepcionToken })).status, 403);
    assert.equal((await client.request("DELETE", `/work-orders/${id}`, { token: mecanicoToken })).status, 403);

    const deleted = await client.request("DELETE", `/work-orders/${id}`, { token: jefeToken });
    assert.equal(deleted.status, 204);
    assert.equal(deleted.text, "");
    assert.equal((await client.request("GET", `/work-orders/${id}`, { token: jefeToken })).status, 404);
  });

  it("filtra ordenes por status", async () => {
    const recepcionToken = await client.loginAs("recepcion");
    await client.request("POST", "/work-orders", { token: recepcionToken, json: { motorcycleId: 1, description: "Cambio de aceite y revision" } });

    const response = await client.request("GET", "/work-orders?status=recibida", { token: recepcionToken });
    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 1);
  });

  it("400 INVALID_BODY si motorcycleId no corresponde a una moto registrada", async () => {
    const recepcionToken = await client.loginAs("recepcion");
    const response = await client.request("POST", "/work-orders", { token: recepcionToken, json: { motorcycleId: 999, description: "Cambio de aceite y revision" } });

    assert.equal(response.status, 400);
  });
});

describe("errores generales", () => {
  it("404 ROUTE_NOT_FOUND en una ruta desconocida", async () => {
    const response = await client.request("GET", "/nada");

    assert.equal(response.status, 404);
    assert.equal(response.body.code, "ROUTE_NOT_FOUND");
  });

  it("400 INVALID_JSON si el cuerpo no es JSON valido", async () => {
    const token = await client.loginAs("recepcion");
    const response = await client.request("POST", "/motorcycles", { token, body: "{oops", headers: { "Content-Type": "application/json" } });

    assert.equal(response.status, 400);
    assert.equal(response.body.code, "INVALID_JSON");
  });

  it("un fallo interno inesperado responde 500 generico, no lo filtra y lo registra", async (t) => {
    const log = t.mock.method(console, "error", () => {});
    const failure = new Error("bug interno con datos sensibles");
    const broken = await startApp(createApp({ jwtSecret: "clave-de-pruebas", motorcycles: { list: () => { throw failure; }, getById() {}, create() {}, exists: () => true } }));

    try {
      const token = await broken.loginAs("recepcion");
      const response = await broken.request("GET", "/motorcycles", { token });

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
