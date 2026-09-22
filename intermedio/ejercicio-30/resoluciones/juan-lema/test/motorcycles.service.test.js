import { beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { createMotorcyclesService } from "../src/services/motorcycles.service.js";

const validBody = { plate: "abc1234", brand: "Yamaha", model: "MT-07", ownerName: "Carlos Vega" };

function assertAppError(action, status, code) {
  assert.throws(action, (error) => {
    assert.equal(error.name, "AppError");
    assert.equal(error.status, status);
    assert.equal(error.code, code);
    return true;
  });
}

describe("createMotorcyclesService", () => {
  let service;
  beforeEach(() => {
    service = createMotorcyclesService();
  });

  it("crea con id consecutivo y normaliza la placa a mayusculas", () => {
    const motorcycle = service.create(validBody);

    assert.deepEqual(motorcycle, { id: 1, plate: "ABC1234", brand: "Yamaha", model: "MT-07", ownerName: "Carlos Vega" });
    assert.equal(service.create({ ...validBody, plate: "xyz9999" }).id, 2);
  });

  it("recorta los campos de texto", () => {
    assert.equal(service.create({ ...validBody, brand: "  Yamaha  " }).brand, "Yamaha");
  });

  for (const [label, plate] of [["muy corta", "AB1"], ["muy larga", "ABCDEFGHI1"], ["con espacio", "ABC 123"], ["con guion", "ABC-123"], ["numerica", 1234], ["ausente", undefined]]) {
    it(`rechaza plate: ${label}`, () => assertAppError(() => service.create({ ...validBody, plate }), 400, "INVALID_BODY"));
  }

  for (const [label, body] of [["brand corta", { ...validBody, brand: "A" }], ["model corto", { ...validBody, model: "A" }], ["ownerName corto", { ...validBody, ownerName: "A" }], ["sin cuerpo", undefined]]) {
    it(`rechaza: ${label}`, () => assertAppError(() => service.create(body), 400, "INVALID_BODY"));
  }

  it("409 PLATE_TAKEN con una placa repetida (sin importar mayusculas)", () => {
    service.create(validBody);

    assertAppError(() => service.create({ ...validBody, plate: "ABC1234" }), 409, "PLATE_TAKEN");
    assert.equal(service.list().length, 1);
  });

  it("list, getById devuelven copias, no el objeto interno", () => {
    const created = service.create(validBody);
    service.list()[0].brand = "hackeado";
    service.getById(created.id).brand = "hackeado";

    assert.equal(service.getById(created.id).brand, "Yamaha");
  });

  for (const id of ["abc", "0", "-1", "1.5"]) {
    it(`getById rechaza el id ${JSON.stringify(id)}`, () => assertAppError(() => service.getById(id), 400, "INVALID_ID"));
  }

  it("getById de un id inexistente da 404", () => {
    assertAppError(() => service.getById(99), 404, "NOT_FOUND");
  });

  it("exists confirma o descarta un id sin lanzar errores", () => {
    const created = service.create(validBody);

    assert.equal(service.exists(created.id), true);
    assert.equal(service.exists(999), false);
    assert.equal(service.exists("abc"), false);
  });

  it("una semilla invalida hace fallar la creacion del servicio", () => {
    assert.throws(() => createMotorcyclesService({ seed: [{ ...validBody, plate: "x" }] }));
  });
});
