import { beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { createDropsService, LOOT_TIERS } from "../src/services/drops.service.js";

const validBody = { zone: "Torre de Radio", lootTier: "epico" };

function assertAppError(action, status, code) {
  assert.throws(action, (error) => {
    assert.equal(error.name, "AppError");
    assert.equal(error.status, status);
    assert.equal(error.code, code);
    return true;
  });
}

describe("createDropsService", () => {
  let service;
  beforeEach(() => {
    service = createDropsService();
  });

  it("crea con ids consecutivos y claimed en false por defecto", () => {
    const drop = service.create(validBody);

    assert.deepEqual(drop, { id: 1, zone: "Torre de Radio", lootTier: "epico", claimed: false });
    assert.equal(service.create(validBody).id, 2);
  });

  it("recorta zone", () => {
    assert.equal(service.create({ ...validBody, zone: "  Torre de Radio  " }).zone, "Torre de Radio");
  });

  for (const [label, body] of [
    ["zone corta", { ...validBody, zone: "A" }],
    ["zone larga", { ...validBody, zone: "x".repeat(41) }],
    ["sin zone", { lootTier: "epico" }],
    ["lootTier desconocido", { ...validBody, lootTier: "mitico" }],
    ["sin cuerpo", undefined],
  ]) {
    it(`create rechaza: ${label}`, () => assertAppError(() => service.create(body), 400, "INVALID_BODY"));
  }

  it("LOOT_TIERS son exactamente los que acepta la validacion", () => {
    for (const lootTier of LOOT_TIERS) assert.equal(service.create({ ...validBody, lootTier }).lootTier, lootTier);
  });

  it("list y getById devuelven copias, no el objeto interno", () => {
    const created = service.create(validBody);
    service.list()[0].claimed = true;
    service.getById(created.id).claimed = true;

    assert.equal(service.getById(created.id).claimed, false);
  });

  it("list filtra por zone, lootTier y claimed combinados", () => {
    service.create({ zone: "Zona A", lootTier: "comun" });
    service.create({ zone: "Zona A", lootTier: "raro" });
    service.create({ zone: "Zona B", lootTier: "comun" });

    assert.equal(service.list({ zone: "Zona A" }).length, 2);
    assert.equal(service.list({ lootTier: "comun" }).length, 2);
    assert.equal(service.list({ zone: "Zona A", lootTier: "raro" }).length, 1);
    assert.equal(service.list({ claimed: "false" }).length, 3);
    assert.equal(service.list({ claimed: "true" }).length, 0);
  });

  for (const [label, query] of [["lootTier invalido", { lootTier: "mitico" }], ["claimed no booleano", { claimed: "quiza" }]]) {
    it(`list rechaza: ${label}`, () => assertAppError(() => service.list(query), 400, "INVALID_QUERY"));
  }

  for (const id of ["abc", "0", "-1", "1.5"]) {
    it(`getById/claim/remove rechazan el id ${JSON.stringify(id)}`, () => {
      assertAppError(() => service.getById(id), 400, "INVALID_ID");
      assertAppError(() => service.claim(id), 400, "INVALID_ID");
      assertAppError(() => service.remove(id), 400, "INVALID_ID");
    });
  }

  it("un id inexistente da 404 en getById, claim y remove", () => {
    assertAppError(() => service.getById(99), 404, "NOT_FOUND");
    assertAppError(() => service.claim(99), 404, "NOT_FOUND");
    assertAppError(() => service.remove(99), 404, "NOT_FOUND");
  });

  it("claim marca claimed y reclamar dos veces da 409", () => {
    const created = service.create(validBody);

    assert.equal(service.claim(created.id).claimed, true);
    assertAppError(() => service.claim(created.id), 409, "ALREADY_CLAIMED");
  });

  it("remove borra de verdad y no reutiliza el id", () => {
    const first = service.create(validBody);
    service.remove(first.id);

    assertAppError(() => service.getById(first.id), 404, "NOT_FOUND");
    assert.equal(service.create(validBody).id, 2);
  });

  it("una semilla invalida hace fallar la creacion del servicio", () => {
    assert.throws(() => createDropsService({ seed: [{ zone: "x", lootTier: "invalido" }] }));
  });
});
