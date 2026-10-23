import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseHttpCollection } from "../test-support/http-collection.js";

describe("parseHttpCollection", () => {
  it("lee titulo, expect, metodo, url, headers y body", () => {
    const [request] = parseHttpCollection(`### Crear algo
# expect: 201
POST {{baseUrl}}/drops
Content-Type: application/json

{
  "zone": "Zona X"
}
`);

    assert.deepEqual(request, { title: "Crear algo", expectedStatus: 201, method: "POST", url: "{{baseUrl}}/drops", headers: { "Content-Type": "application/json" }, body: '{\n  "zone": "Zona X"\n}' });
  });

  it("una peticion sin cuerpo ni headers queda con body undefined y headers vacios", () => {
    const [request] = parseHttpCollection(`### Listar
# expect: 200
GET {{baseUrl}}/drops
`);

    assert.deepEqual(request.headers, {});
    assert.equal(request.body, undefined);
  });

  it("acepta lineas en blanco extra entre el titulo, el expect y la peticion", () => {
    const [request] = parseHttpCollection(`### Con espacios


# expect: 204

DELETE {{baseUrl}}/drops/1
`);

    assert.equal(request.method, "DELETE");
    assert.equal(request.expectedStatus, 204);
  });

  it("parsea varios bloques en el mismo archivo, en orden", () => {
    const requests = parseHttpCollection(`### Uno
# expect: 200
GET {{baseUrl}}/a

### Dos
# expect: 404
GET {{baseUrl}}/b
`);

    assert.deepEqual(requests.map((r) => r.title), ["Uno", "Dos"]);
  });

  it("ignora una linea de variable (@nombre = valor) antes del primer bloque", () => {
    const requests = parseHttpCollection(`@baseUrl = http://localhost:4028

### Salud
# expect: 200
GET {{baseUrl}}/health
`);

    assert.equal(requests.length, 1);
  });

  it("rechaza un bloque sin '# expect:'", () => {
    assert.throws(() => parseHttpCollection(`### Sin expect\nGET {{baseUrl}}/drops\n`), /no declara "# expect/);
  });

  it("rechaza un bloque cuyo status esperado no es un numero", () => {
    assert.throws(() => parseHttpCollection(`### Mal\n# expect: ok\nGET {{baseUrl}}/drops\n`), /no declara "# expect/);
  });

  it("rechaza un bloque sin una linea de peticion valida", () => {
    assert.throws(() => parseHttpCollection(`### Sin peticion\n# expect: 200\nesto no es una peticion\n`), /no tiene una linea de peticion/);
  });

  it("rechaza un metodo HTTP desconocido", () => {
    assert.throws(() => parseHttpCollection(`### Metodo raro\n# expect: 200\nFETCH {{baseUrl}}/drops\n`), /no tiene una linea de peticion/);
  });
});
