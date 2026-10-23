import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { startApp } from "../test-support/client.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const login = (client, json) => client.request("POST", "/auth/login", { json });

let client;
beforeEach(async () => {
  client = await startApp(createApp());
});
afterEach(() => client.close());

describe("POST /auth/login", () => {
  it("responde 200 con el token y el usuario, sin exponer la password", async () => {
    const { status, headers, body, text } = await login(client, { username: "aria", password: "demo123" });

    assert.equal(status, 200);
    assert.match(headers.get("content-type"), /^application\/json; charset=utf-8$/);
    assert.equal(body.ok, true);
    assert.deepEqual(body.data.user, { id: 1, username: "aria", role: "player" });
    assert.match(body.data.token, UUID);
    assert.ok(!/password|demo123/.test(text), "la respuesta filtra la password");
  });

  it("la respuesta nunca se guarda en cache (Cache-Control: no-store)", async () => {
    const { headers } = await login(client, { username: "aria", password: "demo123" });

    assert.equal(headers.get("cache-control"), "no-store");
  });

  it("cada login entrega un token distinto y ambos siguen validos", async () => {
    const first = (await login(client, { username: "aria", password: "demo123" })).body.data.token;
    const second = (await login(client, { username: "aria", password: "demo123" })).body.data.token;

    assert.notEqual(first, second);
    assert.equal((await client.request("GET", "/auth/me", { token: first })).status, 200);
    assert.equal((await client.request("GET", "/auth/me", { token: second })).status, 200);
  });

  it("entrega el rol correcto de cada usuario", async () => {
    for (const [username, password, role] of [["aria", "demo123", "player"], ["brom", "demo456", "player"], ["gm", "demo789", "admin"]]) {
      assert.equal((await login(client, { username, password })).body.data.user.role, role);
    }
  });

  const badBodies = [
    ["sin campos", {}, "INVALID_BODY"],
    ["sin password", { username: "aria" }, "INVALID_BODY"],
    ["sin username", { password: "demo123" }, "INVALID_BODY"],
    ["username vacio", { username: "", password: "demo123" }, "INVALID_BODY"],
    ["password vacia", { username: "aria", password: "" }, "INVALID_BODY"],
    ["campos numericos", { username: 1, password: 2 }, "INVALID_BODY"],
    ["campos nulos", { username: null, password: null }, "INVALID_BODY"],
    ["campos objeto (intento de inyeccion)", { username: { $ne: "" }, password: { $ne: "" } }, "INVALID_BODY"],
  ];

  for (const [label, json, code] of badBodies) {
    it(`400 ${code}: ${label}`, async () => {
      const { status, body } = await login(client, json);

      assert.equal(status, 400);
      assert.equal(body.code, code);
    });
  }

  it("400 si el cuerpo es un arreglo o no hay cuerpo", async () => {
    assert.equal((await login(client, [])).status, 400);
    assert.equal((await client.request("POST", "/auth/login")).status, 400);
  });

  for (const [label, username, password] of [["password incorrecta", "aria", "mala"], ["usuario inexistente", "nadie", "demo123"], ["usuario en mayusculas", "ARIA", "demo123"], ["password de otro usuario", "aria", "demo456"], ["usuario con espacios", " aria ", "demo123"]]) {
    it(`401 INVALID_CREDENTIALS: ${label}`, async () => {
      const { status, body, headers } = await login(client, { username, password });

      assert.equal(status, 401);
      assert.equal(body.code, "INVALID_CREDENTIALS");
      assert.equal(headers.get("cache-control"), "no-store");
    });
  }

  it("usuario inexistente y password incorrecta dan exactamente la misma respuesta (no revela que usuarios existen)", async () => {
    const wrongPassword = await login(client, { username: "aria", password: "mala" });
    const unknownUser = await login(client, { username: "nadie", password: "mala" });

    assert.equal(wrongPassword.status, unknownUser.status);
    assert.equal(wrongPassword.text, unknownUser.text);
  });
});

describe("GET /auth/me", () => {
  it("devuelve el usuario del token", async () => {
    const token = await client.loginAs("gm");
    const { status, body } = await client.request("GET", "/auth/me", { token });

    assert.equal(status, 200);
    assert.deepEqual(body, { ok: true, data: { id: 3, username: "gm", role: "admin" } });
  });

  it("acepta el esquema Bearer en minusculas o mayusculas", async () => {
    const token = await client.loginAs("aria");

    for (const scheme of ["bearer", "BEARER", "Bearer"]) {
      assert.equal((await client.request("GET", "/auth/me", { headers: { Authorization: `${scheme} ${token}` } })).status, 200, scheme);
    }
  });

  const missing = [
    ["sin header", undefined],
    ["header vacio", ""],
    ["solo el esquema", "Bearer"],
    ["esquema y espacio sin token", "Bearer "],
    ["esquema Basic", "Basic YXJpYTpkZW1vMTIz"],
    ["token sin esquema", "abc"],
  ];

  for (const [label, authorization] of missing) {
    it(`401 MISSING_TOKEN con WWW-Authenticate: ${label}`, async () => {
      const { status, body, headers } = await client.request("GET", "/auth/me", { headers: authorization === undefined ? {} : { Authorization: authorization } });

      assert.equal(status, 401);
      assert.equal(body.code, "MISSING_TOKEN");
      assert.equal(headers.get("www-authenticate"), "Bearer");
    });
  }

  it("401 INVALID_TOKEN con el desafio invalid_token si el token no existe", async () => {
    const { status, body, headers } = await client.request("GET", "/auth/me", { token: "no-existe" });

    assert.equal(status, 401);
    assert.equal(body.code, "INVALID_TOKEN");
    assert.equal(headers.get("www-authenticate"), 'Bearer error="invalid_token"');
  });

  it("no acepta el token con doble espacio ni por query string", async () => {
    const token = await client.loginAs("aria");

    assert.equal((await client.request("GET", "/auth/me", { headers: { Authorization: `Bearer  ${token}` } })).status, 401);
    assert.equal((await client.request("GET", `/auth/me?token=${token}`)).status, 401);
    assert.equal((await client.request("GET", `/auth/me?access_token=${token}`)).status, 401);
  });

  it("no se guarda en cache", async () => {
    const { headers } = await client.request("GET", "/auth/me", { token: await client.loginAs("aria") });

    assert.equal(headers.get("cache-control"), "no-store");
  });
});

describe("POST /auth/logout", () => {
  it("responde 204 sin cuerpo ni Content-Type e invalida el token", async () => {
    const token = await client.loginAs("aria");
    const { status, text, headers } = await client.request("POST", "/auth/logout", { token });

    assert.equal(status, 204);
    assert.equal(text, "");
    assert.equal(headers.get("content-type"), null);
    assert.equal((await client.request("GET", "/auth/me", { token })).body.code, "INVALID_TOKEN");
  });

  it("cerrar una sesion no cierra las demas del mismo usuario", async () => {
    const first = await client.loginAs("aria");
    const second = await client.loginAs("aria");

    await client.request("POST", "/auth/logout", { token: first });

    assert.equal((await client.request("GET", "/auth/me", { token: first })).status, 401);
    assert.equal((await client.request("GET", "/auth/me", { token: second })).status, 200);
  });

  it("cerrar sesion dos veces con el mismo token da 401 la segunda vez", async () => {
    const token = await client.loginAs("aria");

    assert.equal((await client.request("POST", "/auth/logout", { token })).status, 204);
    assert.equal((await client.request("POST", "/auth/logout", { token })).status, 401);
  });

  it("exige token", async () => {
    assert.equal((await client.request("POST", "/auth/logout")).status, 401);
  });
});

describe("estado aislado entre instancias de la app", () => {
  it("un token de una app no es valido en otra", async () => {
    const other = await startApp(createApp());
    try {
      const token = await client.loginAs("aria");

      assert.equal((await client.request("GET", "/auth/me", { token })).status, 200);
      assert.equal((await other.request("GET", "/auth/me", { token })).status, 401);
    } finally {
      await other.close();
    }
  });
});
