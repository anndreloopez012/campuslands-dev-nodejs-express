import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { errorHandler } from "../src/middlewares/error-handler.js";
import { startApp } from "../test-support/client.js";

let client;
beforeEach(async () => {
  client = await startApp(createApp());
});
afterEach(() => client.close());

const JSON_HEADERS = { "Content-Type": "application/json" };
const rawJson = (path, body, method = "POST") => client.request(method, path, { body, headers: JSON_HEADERS });

describe("405 Method Not Allowed y OPTIONS", () => {
  const COLLECTION = "GET, HEAD, POST, OPTIONS";
  const ITEM = "GET, HEAD, PATCH, DELETE, OPTIONS";
  const READ_ONLY = "GET, HEAD, OPTIONS";
  const POST_ONLY = "POST, OPTIONS";

  const notAllowed = [
    ["PUT", "/characters", COLLECTION],
    ["PATCH", "/characters", COLLECTION],
    ["DELETE", "/characters", COLLECTION],
    ["POST", "/characters/1", ITEM],
    ["PUT", "/characters/1", ITEM],
    ["PUT", "/characters/abc", ITEM],
    ["POST", "/health", READ_ONLY],
    ["DELETE", "/health", READ_ONLY],
    ["GET", "/auth/login", POST_ONLY],
    ["PUT", "/auth/login", POST_ONLY],
    ["POST", "/auth/me", READ_ONLY],
    ["GET", "/auth/logout", POST_ONLY],
  ];

  for (const [method, path, allow] of notAllowed) {
    it(`${method} ${path} -> 405 con Allow: ${allow}`, async () => {
      const response = await client.request(method, path);

      assert.equal(response.status, 405);
      assert.equal(response.headers.get("allow"), allow);
      assert.equal(response.body.code, "METHOD_NOT_ALLOWED");
      assert.ok(response.body.message.includes(allow));
    });
  }

  it("el 405 se decide antes que la autenticacion", async () => {
    assert.equal((await client.request("DELETE", "/characters")).status, 405);
  });

  const preflight = [
    ["/characters", COLLECTION],
    ["/characters/1", ITEM],
    ["/health", READ_ONLY],
    ["/auth/login", POST_ONLY],
    ["/auth/me", READ_ONLY],
    ["/auth/logout", POST_ONLY],
  ];

  for (const [path, allow] of preflight) {
    it(`OPTIONS ${path} -> 204 con Allow: ${allow}`, async () => {
      const response = await client.request("OPTIONS", path);

      assert.equal(response.status, 204);
      assert.equal(response.headers.get("allow"), allow);
      assert.equal(response.text, "");
    });
  }

  it("OPTIONS sobre una ruta inexistente es 404", async () => {
    const response = await client.request("OPTIONS", "/nada");

    assert.equal(response.status, 404);
    assert.equal(response.body.code, "ROUTE_NOT_FOUND");
  });

  it("los metodos permitidos no reciben el header Allow de un 405", async () => {
    assert.equal((await client.request("GET", "/characters")).headers.get("allow"), null);
  });
});

describe("Content-Type del cuerpo", () => {
  for (const [label, contentType, body] of [
    ["texto plano", "text/plain", "hola"],
    ["formulario", "application/x-www-form-urlencoded", "name=Nova&class=mago"],
    ["multipart", "multipart/form-data; boundary=x", "--x\r\n\r\n--x--"],
    ["JSON de proveedor (+json)", "application/vnd.api+json", '{"name":"Nova"}'],
    ["XML", "application/xml", "<a/>"],
  ]) {
    it(`415 UNSUPPORTED_MEDIA_TYPE: ${label}`, async () => {
      const response = await client.request("POST", "/characters", { body, headers: { "Content-Type": contentType } });

      assert.equal(response.status, 415);
      assert.equal(response.body.code, "UNSUPPORTED_MEDIA_TYPE");
    });
  }

  it("un cuerpo de texto sin declarar Content-Type tambien es 415", async () => {
    assert.equal((await client.request("POST", "/characters", { body: '{"name":"Nova"}' })).status, 415);
  });

  it("el 415 se decide antes que la autenticacion", async () => {
    const response = await client.request("POST", "/characters", { body: "x", headers: { "Content-Type": "text/plain" } });

    assert.equal(response.status, 415);
  });

  for (const contentType of ["application/json", "application/json; charset=utf-8", "APPLICATION/JSON", "application/json;charset=UTF-8"]) {
    it(`acepta ${contentType}`, async () => {
      const token = await client.loginAs("aria");
      const response = await client.request("POST", "/characters", { token, body: '{"name":"Nova","class":"mago"}', headers: { "Content-Type": contentType } });

      assert.equal(response.status, 201);
    });
  }

  it("una codificacion no soportada (iso-8859-1) responde 415 BAD_REQUEST sin filtrar detalles de la libreria", async () => {
    const response = await client.request("POST", "/characters", { body: "{}", headers: { "Content-Type": "application/json; charset=iso-8859-1" } });

    assert.equal(response.status, 415);
    assert.deepEqual(response.body, { ok: false, code: "BAD_REQUEST", message: "Peticion invalida" });
  });

  it("los metodos sin cuerpo no exigen Content-Type", async () => {
    assert.equal((await client.request("GET", "/characters")).status, 200);
    assert.equal((await client.request("POST", "/auth/logout", { token: await client.loginAs("aria") })).status, 204);
  });
});

describe("JSON del cuerpo", () => {
  for (const [label, body] of [
    ["llave sin cerrar", "{"],
    ["comillas simples", "{'name':'Nova'}"],
    ["claves sin comillas", "{name: 'Nova'}"],
    ["coma final", '{"name":"Nova",}'],
    ["llave de mas", '{"name":"Nova"}}'],
    ["arreglo truncado", "[1,"],
    ["undefined", "undefined"],
    ["NaN", "NaN"],
    ["texto suelto", "hola"],
  ]) {
    it(`400 INVALID_JSON: ${label}`, async () => {
      const response = await rawJson("/characters", body);

      assert.equal(response.status, 400);
      assert.deepEqual(response.body, { ok: false, code: "INVALID_JSON", message: "El cuerpo no es un JSON valido" });
    });
  }

  for (const [label, body] of [["cadena", '"texto"'], ["numero", "5"], ["null", "null"], ["booleano", "true"]]) {
    it(`400 INVALID_JSON: un valor primitivo (${label}) no es un cuerpo valido`, async () => {
      assert.equal((await rawJson("/characters", body)).body.code, "INVALID_JSON");
    });
  }

  it("un cuerpo vacio con Content-Type JSON llega como 'sin cuerpo' (400 INVALID_BODY)", async () => {
    const response = await client.request("POST", "/characters", { body: "", headers: JSON_HEADERS, token: await client.loginAs("aria") });

    assert.equal(response.status, 400);
    assert.equal(response.body.code, "INVALID_BODY");
  });

  it("el mensaje de error no incluye el texto del cuerpo ni detalles del parser", async () => {
    const response = await rawJson("/characters", '{"secreto":"hunter2",');

    assert.ok(!response.text.includes("hunter2"));
    assert.ok(!/position|token|JSON\.parse/i.test(response.text));
  });

  it("los caracteres Unicode del cuerpo se conservan", async () => {
    const token = await client.loginAs("aria");
    const created = await client.request("POST", "/characters", { token, json: { name: "Ñandú del Sur", class: "picaro" } });

    assert.equal(created.body.data.name, "Ñandú del Sur");
  });
});

describe("limite de tamano del cuerpo (10 KB)", () => {
  const bodyOfSize = (bytes) => `{"name":"${"x".repeat(bytes - 11)}"}`;

  it("10240 bytes todavia se procesan (y fallan por la validacion, no por el tamano)", async () => {
    const body = bodyOfSize(10240);
    const response = await rawJson("/characters", body);

    assert.equal(Buffer.byteLength(body), 10240);
    assert.notEqual(response.status, 413);
    assert.equal(response.status, 401);
  });

  it("10240 bytes autenticados llegan a la validacion del servicio", async () => {
    const response = await client.request("POST", "/characters", { token: await client.loginAs("aria"), body: bodyOfSize(10240), headers: JSON_HEADERS });

    assert.equal(response.status, 400);
    assert.equal(response.body.code, "INVALID_BODY");
  });

  it("10241 bytes responden 413 PAYLOAD_TOO_LARGE", async () => {
    const response = await rawJson("/characters", bodyOfSize(10241));

    assert.equal(response.status, 413);
    assert.deepEqual(response.body, { ok: false, code: "PAYLOAD_TOO_LARGE", message: "El cuerpo supera el limite de 10 KB" });
  });

  it("el servidor sigue atendiendo despues de rechazar un cuerpo enorme", async () => {
    await rawJson("/characters", bodyOfSize(500_000));

    assert.equal((await client.request("GET", "/health")).status, 200);
  });
});

describe("cabeceras de respuesta", () => {
  const requests = [
    ["200 /health", "GET", "/health"],
    ["200 /characters", "GET", "/characters"],
    ["200 /characters/1", "GET", "/characters/1"],
    ["404 ruta inexistente", "GET", "/nada"],
    ["404 personaje", "GET", "/characters/99"],
    ["400 id invalido", "GET", "/characters/abc"],
    ["401 sin token", "GET", "/auth/me"],
    ["405", "PUT", "/characters"],
  ];

  for (const [label, method, path] of requests) {
    it(`${label}: no expone X-Powered-By y envia X-Content-Type-Options: nosniff`, async () => {
      const { headers } = await client.request(method, path);

      assert.equal(headers.get("x-powered-by"), null);
      assert.equal(headers.get("x-content-type-options"), "nosniff");
    });
  }

  it("las respuestas JSON declaran application/json; charset=utf-8 (exitos y errores)", async () => {
    for (const [method, path] of [["GET", "/health"], ["GET", "/characters/99"], ["PUT", "/characters"], ["GET", "/nada"]]) {
      assert.match((await client.request(method, path)).headers.get("content-type"), /^application\/json; charset=utf-8$/, `${method} ${path}`);
    }
  });

  it("Cache-Control: no-store en todo /auth (exitos y errores) y no en /characters", async () => {
    const token = await client.loginAs("aria");

    for (const [method, path, options] of [["POST", "/auth/login", {}], ["GET", "/auth/me", { token }], ["GET", "/auth/me", {}], ["GET", "/auth/nada", {}], ["PUT", "/auth/login", {}]]) {
      assert.equal((await client.request(method, path, options)).headers.get("cache-control"), "no-store", `${method} ${path}`);
    }
    assert.notEqual((await client.request("GET", "/characters")).headers.get("cache-control"), "no-store");
  });

  it("WWW-Authenticate solo aparece en los 401", async () => {
    assert.ok((await client.request("GET", "/auth/me")).headers.get("www-authenticate"));
    assert.equal((await client.request("GET", "/characters")).headers.get("www-authenticate"), null);
    assert.equal((await client.request("GET", "/characters/99")).headers.get("www-authenticate"), null);
  });
});

describe("inventario de rutas: que exige autenticacion y que no", () => {
  const routes = [
    ["GET", "/health", false, {}],
    ["POST", "/auth/login", false, {}],
    ["GET", "/auth/me", true, {}],
    ["POST", "/auth/logout", true, {}],
    ["GET", "/characters", false, {}],
    ["GET", "/characters/1", false, {}],
    ["POST", "/characters", true, { json: { name: "Nova", class: "mago" } }],
    ["PATCH", "/characters/1", true, { json: { level: 5 } }],
    ["DELETE", "/characters/1", true, {}],
  ];

  for (const [method, path, isProtected, options] of routes) {
    if (isProtected) {
      it(`${method} ${path} exige token (sin token y con token falso dan 401)`, async () => {
        assert.equal((await client.request(method, path, options)).status, 401);
        assert.equal((await client.request(method, path, { ...options, token: "falso" })).status, 401);
      });
    } else {
      it(`${method} ${path} es publica (nunca responde 401, aunque llegue un token falso)`, async () => {
        assert.notEqual((await client.request(method, path, options)).status, 401);
        assert.notEqual((await client.request(method, path, { ...options, token: "falso" })).status, 401);
      });
    }
  }

  it("ninguna ruta protegida modifico datos durante estos intentos sin token", async () => {
    for (const [method, path, isProtected, options] of routes) if (isProtected) await client.request(method, path, options);

    const { body } = await client.request("GET", "/characters");
    assert.equal(body.meta.total, 8);
    assert.equal(body.data[0].level, 12);
  });
});

describe("todos los errores comparten el mismo envoltorio", () => {
  const failures = [
    ["ruta inexistente", "GET", "/nada", {}],
    ["subruta inexistente", "GET", "/characters/1/extra", {}],
    ["id invalido", "GET", "/characters/abc", {}],
    ["personaje inexistente", "GET", "/characters/99", {}],
    ["query invalida", "GET", "/characters?class=x", {}],
    ["metodo no permitido", "PUT", "/characters", {}],
    ["sin token", "GET", "/auth/me", {}],
    ["credenciales invalidas", "POST", "/auth/login", { json: { username: "x", password: "y" } }],
    ["login sin cuerpo", "POST", "/auth/login", {}],
    ["content-type no soportado", "POST", "/characters", { body: "x", headers: { "Content-Type": "text/plain" } }],
    ["JSON malformado", "POST", "/characters", { body: "{", headers: JSON_HEADERS }],
    ["cuerpo demasiado grande", "POST", "/characters", { body: `{"a":"${"x".repeat(20000)}"}`, headers: JSON_HEADERS }],
  ];

  for (const [label, method, path, options] of failures) {
    it(`${label}: { ok: false, code, message } y sin rastros internos`, async () => {
      const response = await client.request(method, path, options);

      assert.ok(response.status >= 400 && response.status < 500, `estado ${response.status}`);
      assert.deepEqual(Object.keys(response.body).sort(), ["code", "message", "ok"]);
      assert.equal(response.body.ok, false);
      assert.match(response.body.code, /^[A-Z_]+$/);
      assert.ok(typeof response.body.message === "string" && response.body.message.length > 0);
      assert.ok(!/node_modules|\.js:\d+|\bat \S+ \(/.test(response.text), "la respuesta filtra rastros del servidor");
    });
  }
});

describe("errores inesperados (500)", () => {
  it("un fallo interno responde 500 generico, no filtra detalles, se registra y el servidor sigue vivo", async (t) => {
    const log = t.mock.method(console, "error", () => {});
    const failure = new Error("db password hunter2 en /srv/app/db.js:10");
    const broken = await startApp(createApp({ characters: { list() { throw failure; } } }));

    try {
      const response = await broken.request("GET", "/characters");

      assert.equal(response.status, 500);
      assert.deepEqual(response.body, { ok: false, code: "INTERNAL_ERROR", message: "Error interno" });
      assert.ok(!response.text.includes("hunter2"));
      assert.deepEqual(log.mock.calls.map((call) => call.arguments[0]), [failure]);
      assert.equal((await broken.request("GET", "/health")).status, 200);
    } finally {
      await broken.close();
    }
  });

  it("un fallo del servicio de autenticacion tambien es 500 generico", async (t) => {
    t.mock.method(console, "error", () => {});
    const broken = await startApp(createApp({ auth: { verify() { throw new Error("redis caido"); }, login() {}, logout() {} } }));

    try {
      const response = await broken.request("GET", "/auth/me", { token: "cualquiera" });

      assert.equal(response.status, 500);
      assert.equal(response.body.message, "Error interno");
    } finally {
      await broken.close();
    }
  });

  it("si la respuesta ya empezo a enviarse, el manejador delega en Express en vez de escribir otra", (t) => {
    const next = t.mock.fn();
    const failure = new Error("tarde");

    errorHandler(failure, {}, { headersSent: true }, next);

    assert.equal(next.mock.callCount(), 1);
    assert.equal(next.mock.calls[0].arguments[0], failure);
  });
});
