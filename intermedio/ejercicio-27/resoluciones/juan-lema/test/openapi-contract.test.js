import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { createChampionsService } from "../src/services/champions.service.js";
import { startApp } from "../test-support/client.js";

let client;
let spec;

before(async () => {
  client = await startApp(createApp({ champions: createChampionsService() }));
  spec = (await client.request("GET", "/openapi.json")).body;
});
after(() => client.close());

function resolveRef(ref) {
  return ref.split("/").slice(1).reduce((node, key) => node[key], spec);
}

function resolveRefs(node) {
  if (Array.isArray(node)) return node.map(resolveRefs);
  if (node && typeof node === "object") {
    if (typeof node.$ref === "string") return resolveRefs(resolveRef(node.$ref));
    return Object.fromEntries(Object.entries(node).map(([key, value]) => [key, resolveRefs(value)]));
  }
  return node;
}

describe("el documento OpenAPI es coherente consigo mismo", () => {
  it("cada $ref usado en paths resuelve a un schema que existe en components", () => {
    const refs = JSON.stringify(spec.paths).match(/"\$ref":"([^"]+)"/g) ?? [];

    for (const raw of refs) {
      const ref = raw.match(/"\$ref":"([^"]+)"/)[1];
      assert.doesNotThrow(() => {
        if (resolveRef(ref) === undefined) throw new Error(`$ref roto: ${ref}`);
      }, `$ref roto: ${ref}`);
    }
    assert.ok(refs.length > 0, "el spec deberia usar al menos un $ref (si no, esta prueba no prueba nada)");
  });

  it("todo schema enum documentado coincide con ROLES del servicio (no hay drift entre la doc y el codigo)", async () => {
    const { ROLES } = await import("../src/services/champions.service.js");

    assert.deepEqual(spec.components.schemas.Role.enum, ROLES);
  });
});

describe("cada operacion documentada existe de verdad en la API (sin tocar internos de Express)", () => {
  const operations = [];
  before(() => {
    for (const [docPath, methods] of Object.entries(spec.paths)) {
      const realPath = docPath.replace(/\{([^}]+)\}/g, "1");
      for (const [method, operation] of Object.entries(methods)) operations.push({ docPath, realPath, method, operation });
    }
  });

  it("se encontraron las 4 operaciones esperadas (la prueba realmente recorre algo)", () => {
    assert.equal(operations.length, 4);
  });

  it("cada operacion responde con uno de los status documentados, nunca con ROUTE_NOT_FOUND", async () => {
    for (const { realPath, method, operation, docPath } of operations) {
      const isPost = method === "post";
      const example = isPost ? resolveRefs(operation.requestBody.content["application/json"].schema).example ?? operation.requestBody.content["application/json"].example : undefined;

      const response = await client.request(method.toUpperCase(), realPath, isPost ? { json: example } : {});
      const documented = Object.keys(operation.responses).map(Number);

      assert.ok(documented.includes(response.status), `${method.toUpperCase()} ${docPath} -> ${response.status}, documentados: ${documented.join(",")}`);
      assert.notEqual(response.body?.code, "ROUTE_NOT_FOUND", `${method.toUpperCase()} ${docPath} no existe realmente en la app`);
    }
  });

  it("el ejemplo de exito de cada operacion produce el status 2xx documentado (los ejemplos del spec son reales, no inventados)", async () => {
    for (const { realPath, method, operation, docPath } of operations) {
      const successStatus = Object.keys(operation.responses).map(Number).find((s) => s < 300);
      if (!successStatus) continue;

      const isPost = method === "post";
      const example = isPost ? operation.requestBody.content["application/json"].example : undefined;
      const response = await client.request(method.toUpperCase(), realPath, isPost ? { json: example } : {});

      assert.equal(response.status, successStatus, `${method.toUpperCase()} ${docPath} con su ejemplo documentado deberia dar ${successStatus}`);
    }
  });

  it("cada respuesta de error documentada (400/404) es reproducible y trae el code documentado", async () => {
    for (const { realPath, method, operation, docPath } of operations) {
      for (const [status, response] of Object.entries(operation.responses)) {
        if (Number(status) < 400) continue;

        const example = response.content["application/json"].example;
        const isPost = method === "post";
        const target = status === "404" ? realPath.replace(/\d+$/, "999999") : status === "400" && docPath.includes("{") ? realPath.replace(/\d+$/, "no-es-un-id") : realPath;
        const query = status === "400" && docPath === "/champions" && method === "get" ? "?role=bardo" : "";

        const actual = await client.request(method.toUpperCase(), target + query, isPost ? { json: {} } : {});

        assert.equal(actual.status, Number(status), `${method.toUpperCase()} ${docPath} -> caso de error ${status}`);
        assert.equal(actual.body.code, example.code, `${method.toUpperCase()} ${docPath} -> code de error ${status}`);
      }
    }
  });
});

describe("cada operacion documenta todos los status que realmente puede devolver (no solo los que documenta son ciertos, sino que lo cierto esta documentado)", () => {
  const expected = {
    "GET /health": [200],
    "GET /champions": [200, 400],
    "POST /champions": [201, 400],
    "GET /champions/{id}": [200, 400, 404],
  };

  for (const [operationKey, statuses] of Object.entries(expected)) {
    it(operationKey, () => {
      const [method, docPath] = operationKey.split(" ");
      const documented = Object.keys(spec.paths[docPath][method.toLowerCase()].responses).map(Number).sort();

      assert.deepEqual(documented, [...statuses].sort());
    });
  }
});

describe("Swagger UI y el spec estan disponibles", () => {
  it("/docs redirige o sirve la interfaz sin error de servidor", async () => {
    const response = await client.request("GET", "/docs/");
    assert.ok(response.status < 500);
  });
});
