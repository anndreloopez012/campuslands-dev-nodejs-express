import { beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { createMatchesService } from "../src/services/matches.service.js";
import { validBody } from "../test-support/matches-contract.js";

function assertAppError(action, status, code) {
  assert.throws(action, (error) => {
    assert.equal(error.name, "AppError");
    assert.equal(error.status, status);
    assert.equal(error.code, code);
    return true;
  });
}

describe("createMatchesService", () => {
  let service;
  beforeEach(() => {
    service = createMatchesService();
  });

  it("list, getById y create devuelven copias, no el objeto interno", () => {
    const created = service.create(validBody);
    service.list()[0].status = "hackeado";
    service.getById(created.id).status = "hackeado";
    created.status = "hackeado";

    assert.equal(service.getById(created.id).status, "programado");
  });

  it("start/score/finish tambien devuelven copias", () => {
    const created = service.create(validBody);
    const started = service.start(created.id);
    started.status = "hackeado";

    assert.equal(service.getById(created.id).status, "en_juego");
  });

  it("una semilla invalida hace fallar la creacion del servicio (falla rapido)", () => {
    assert.throws(() => createMatchesService({ seed: [{ homeTeam: "A", awayTeam: "B", modality: "futbol_9" }] }));
  });

  it("start/score/finish rechazan ids invalidos con INVALID_ID", () => {
    assertAppError(() => service.start("abc"), 400, "INVALID_ID");
    assertAppError(() => service.score("abc", { homeScore: 1, awayScore: 0 }), 400, "INVALID_ID");
    assertAppError(() => service.finish("abc"), 400, "INVALID_ID");
  });

  it("start/score/finish sobre un id inexistente dan 404", () => {
    assertAppError(() => service.start(99), 404, "NOT_FOUND");
    assertAppError(() => service.score(99, { homeScore: 1, awayScore: 0 }), 404, "NOT_FOUND");
    assertAppError(() => service.finish(99), 404, "NOT_FOUND");
  });

  it("id invalido se detecta antes que la transicion (el orden de validacion importa)", () => {
    const created = service.create(validBody);
    service.start(created.id);

    assertAppError(() => service.score("abc", { homeScore: 1, awayScore: 0 }), 400, "INVALID_ID");
  });
});
