import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { parseHttpCollection } from "../test-support/http-collection.js";
import { startApp } from "../test-support/client.js";

const collectionPath = fileURLToPath(new URL("../http/drops.http", import.meta.url));
const raw = readFileSync(collectionPath, "utf8");
const requests = parseHttpCollection(raw);

let client;
before(async () => {
  client = await startApp(createApp());
});
after(() => client.close());

describe("http/drops.http se parsea completo", () => {
  it("encuentra las 17 peticiones de ejemplo (la prueba realmente recorre algo)", () => {
    assert.equal(requests.length, 17);
  });

  it("toda peticion declara un status esperado y un metodo soportado", () => {
    for (const { title, expectedStatus, method } of requests) {
      assert.ok(Number.isInteger(expectedStatus) && expectedStatus >= 200 && expectedStatus < 600, `"${title}": expectedStatus invalido`);
      assert.match(method, /^(GET|POST|PATCH|PUT|DELETE)$/, `"${title}": metodo desconocido`);
    }
  });
});

describe("la coleccion completa, ejecutada en orden contra el servidor real", () => {
  it("cada peticion responde exactamente el status documentado en su comentario '# expect'", async () => {
    for (const { title, expectedStatus, method, url, headers, body } of requests) {
      const path = url.replace("{{baseUrl}}", "");
      const response = await client.request(method, path, { headers, body });

      assert.equal(response.status, expectedStatus, `"${title}" (${method} ${path}) -> ${response.status}, la coleccion dice ${expectedStatus}\nrespuesta: ${response.text}`);
    }
  });

  it("los ejemplos con cuerpo JSON son JSON valido (si alguien rompe el ejemplo, esto lo nota antes que el servidor)", () => {
    for (const { title, body } of requests) {
      if (body === undefined) continue;
      assert.doesNotThrow(() => JSON.parse(body), `"${title}" tiene un cuerpo que no es JSON valido`);
    }
  });

  it("las peticiones que crean o modifican algo se reflejan en la que confirma el resultado (la coleccion cuenta una historia real, no pasos sueltos)", async () => {
    const listAfter = await client.request("GET", "/drops");

    assert.equal(listAfter.body.data.length, 3, "se creo 1 drop y se borro 1: sigue habiendo 3");
    assert.ok(listAfter.body.data.find((d) => d.zone === "Torre de Radio"), "el drop creado por el ejemplo POST deberia existir");
    assert.ok(!listAfter.body.data.some((d) => d.id === 2), "el drop 2 fue borrado por el ejemplo DELETE");
    assert.equal(listAfter.body.data.find((d) => d.id === 1).claimed, true, "el drop 1 quedo reclamado por el ejemplo PATCH");
  });
});
