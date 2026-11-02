import { beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { createMotorcyclesService } from "../src/services/motorcycles.service.js";
import { createWorkOrdersService, STATUS_ORDER } from "../src/services/work-orders.service.js";

function assertAppError(action, status, code) {
  assert.throws(action, (error) => {
    assert.equal(error.name, "AppError");
    assert.equal(error.status, status);
    assert.equal(error.code, code);
    return true;
  });
}

describe("createWorkOrdersService", () => {
  let motorcycles;
  let orders;
  let motorcycleId;

  beforeEach(() => {
    motorcycles = createMotorcyclesService();
    orders = createWorkOrdersService({ motorcycles });
    motorcycleId = motorcycles.create({ plate: "ABC1234", brand: "Yamaha", model: "MT-07", ownerName: "Carlos Vega" }).id;
  });

  it("crea la orden en el primer estado, sin mecanico asignado", () => {
    const order = orders.create({ motorcycleId, description: "Cambio de aceite y filtro" });

    assert.deepEqual(order, { id: 1, motorcycleId, description: "Cambio de aceite y filtro", status: "recibida", mechanic: null });
  });

  it("rechaza motorcycleId que no existe", () => {
    assertAppError(() => orders.create({ motorcycleId: 999, description: "Cambio de aceite y filtro" }), 400, "INVALID_BODY");
  });

  it("rechaza motorcycleId invalido", () => {
    assertAppError(() => orders.create({ motorcycleId: "abc", description: "Cambio de aceite y filtro" }), 400, "INVALID_BODY");
  });

  it("rechaza una description demasiado corta o ausente", () => {
    assertAppError(() => orders.create({ motorcycleId, description: "x" }), 400, "INVALID_BODY");
    assertAppError(() => orders.create({ motorcycleId }), 400, "INVALID_BODY");
  });

  it("rechaza si no hay cuerpo", () => {
    assertAppError(() => orders.create(), 400, "INVALID_BODY");
  });

  it("recorre el ciclo completo de estados en orden", () => {
    let order = orders.create({ motorcycleId, description: "Revision general del motor" });

    for (const status of STATUS_ORDER.slice(1)) {
      order = orders.advance(order.id, status, "Beto Mecanico");
      assert.equal(order.status, status);
    }
    assert.equal(order.mechanic, "Beto Mecanico");
  });

  it("solo registra el primer mecanico que avanza la orden", () => {
    const created = orders.create({ motorcycleId, description: "Revision general del motor" });
    orders.advance(created.id, "en_diagnostico", "Beto Mecanico");
    const second = orders.advance(created.id, "en_reparacion", "Otro Mecanico");

    assert.equal(second.mechanic, "Beto Mecanico");
  });

  it("409 INVALID_TRANSITION al saltarse un estado", () => {
    const created = orders.create({ motorcycleId, description: "Revision general del motor" });

    assertAppError(() => orders.advance(created.id, "en_reparacion", "Beto"), 409, "INVALID_TRANSITION");
  });

  it("409 INVALID_TRANSITION al repetir el estado actual", () => {
    const created = orders.create({ motorcycleId, description: "Revision general del motor" });

    assertAppError(() => orders.advance(created.id, "recibida", "Beto"), 409, "INVALID_TRANSITION");
  });

  it("409 INVALID_TRANSITION al intentar avanzar una orden ya entregada", () => {
    let order = orders.create({ motorcycleId, description: "Revision general del motor" });
    for (const status of STATUS_ORDER.slice(1)) order = orders.advance(order.id, status, "Beto");

    assertAppError(() => orders.advance(order.id, "entregada", "Beto"), 409, "INVALID_TRANSITION");
  });

  it("400 INVALID_QUERY con un status de filtro desconocido", () => {
    assertAppError(() => orders.list({ status: "cancelada" }), 400, "INVALID_QUERY");
  });

  it("list filtra por status", () => {
    const a = orders.create({ motorcycleId, description: "Revision general del motor" });
    orders.create({ motorcycleId, description: "Cambio de llantas y frenos" });
    orders.advance(a.id, "en_diagnostico", "Beto");

    assert.equal(orders.list({ status: "recibida" }).length, 1);
    assert.equal(orders.list({ status: "en_diagnostico" }).length, 1);
  });

  it("remove borra de verdad y no reutiliza el id", () => {
    const created = orders.create({ motorcycleId, description: "Revision general del motor" });
    orders.remove(created.id);

    assertAppError(() => orders.getById(created.id), 404, "NOT_FOUND");
    assert.equal(orders.create({ motorcycleId, description: "Otra revision distinta" }).id, 2);
  });

  for (const id of ["abc", "0", "-1"]) {
    it(`getById/advance/remove rechazan el id ${JSON.stringify(id)}`, () => {
      assertAppError(() => orders.getById(id), 400, "INVALID_ID");
      assertAppError(() => orders.advance(id, "en_diagnostico"), 400, "INVALID_ID");
      assertAppError(() => orders.remove(id), 400, "INVALID_ID");
    });
  }

  it("list, getById devuelven copias, no el objeto interno", () => {
    const created = orders.create({ motorcycleId, description: "Revision general del motor" });
    orders.list()[0].status = "hackeado";
    orders.getById(created.id).status = "hackeado";

    assert.equal(orders.getById(created.id).status, "recibida");
  });
});
