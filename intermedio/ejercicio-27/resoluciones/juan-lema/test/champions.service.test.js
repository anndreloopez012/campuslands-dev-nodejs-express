import { beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { createChampionsService, ROLES } from "../src/services/champions.service.js";

const validBody = { name: "Vex Umbrio", role: "adc", winRate: 50.4 };

function assertAppError(action, status, code) {
  assert.throws(action, (error) => {
    assert.equal(error.name, "AppError");
    assert.equal(error.status, status);
    assert.equal(error.code, code);
    return true;
  });
}

describe("createChampionsService", () => {
  let service;
  beforeEach(() => {
    service = createChampionsService();
  });

  it("crea con ids consecutivos y expone exactamente los campos documentados", () => {
    const champion = service.create(validBody);

    assert.deepEqual(Object.keys(champion).sort(), ["id", "name", "role", "winRate"]);
    assert.equal(champion.id, 1);
    assert.equal(service.create(validBody).id, 2);
  });

  it("recorta el nombre", () => {
    assert.equal(service.create({ ...validBody, name: "  Vex Umbrio  " }).name, "Vex Umbrio");
  });

  for (const [label, body] of [
    ["name corto", { ...validBody, name: "A" }],
    ["name largo", { ...validBody, name: "x".repeat(41) }],
    ["role desconocido", { ...validBody, role: "carry" }],
    ["winRate fuera de rango", { ...validBody, winRate: 101 }],
    ["winRate negativo", { ...validBody, winRate: -1 }],
    ["winRate como texto", { ...validBody, winRate: "50" }],
    ["sin cuerpo", undefined],
  ]) {
    it(`create rechaza: ${label}`, () => assertAppError(() => service.create(body), 400, "INVALID_BODY"));
  }

  it("list y getById devuelven copias, no el objeto interno", () => {
    const created = service.create(validBody);
    const listed = service.list()[0];
    listed.name = "hackeado";
    const fetched = service.getById(created.id);
    fetched.name = "hackeado";

    assert.equal(service.getById(created.id).name, "Vex Umbrio");
  });

  it("list filtra por role", () => {
    service.create({ ...validBody, role: "top" });
    service.create({ ...validBody, role: "adc" });

    assert.equal(service.list({ role: "top" }).length, 1);
    assert.equal(service.list({ role: "adc" }).length, 1);
    assert.equal(service.list().length, 2);
  });

  it("list rechaza un role invalido con INVALID_QUERY", () => {
    assertAppError(() => service.list({ role: "bardo" }), 400, "INVALID_QUERY");
  });

  it("ROLES contiene exactamente los roles usados en la validacion", () => {
    for (const role of ROLES) assert.equal(service.create({ ...validBody, role }).role, role);
  });

  for (const id of ["abc", "0", "-1", "1.5"]) {
    it(`getById rechaza el id ${JSON.stringify(id)}`, () => assertAppError(() => service.getById(id), 400, "INVALID_ID"));
  }

  it("getById de un id inexistente da 404 NOT_FOUND", () => {
    service.create(validBody);
    assertAppError(() => service.getById(99), 404, "NOT_FOUND");
  });

  it("una semilla invalida hace fallar la creacion del servicio (falla rapido)", () => {
    assert.throws(() => createChampionsService({ seed: [{ name: "x", role: "top", winRate: 5 }] }));
  });
});
