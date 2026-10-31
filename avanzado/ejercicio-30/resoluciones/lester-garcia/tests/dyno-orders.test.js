import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createItemService, listItemsService } from "../src/services/dyno-orders.service.js";

describe("Avanzado 30 — Proyecto Final Avanzado (Motos y Mecánica)", () => {
  it("Debe registrar una orden de banco dinamométrico, auditarla y garantizar idempotencia", async () => {
    const firstCall = await createItemService({
      idempotencyKey: "idem-moto-final-001",
      plate: "bmw-m1000rr",
      bikeModel: "BMW M 1000 RR",
      engineCc: 999,
      peakWheelHp: 205,
      airFuelRatio: 13.0,
      partsCostUsd: 150
    });

    assert.equal(firstCall.idempotentReplay, false);
    assert.equal(firstCall.order.plate, "BMW-M1000RR");

    const replayCall = await createItemService({
      idempotencyKey: "idem-moto-final-001",
      plate: "bmw-m1000rr",
      bikeModel: "BMW M 1000 RR",
      engineCc: 999,
      peakWheelHp: 205
    });

    assert.equal(replayCall.idempotentReplay, true);
    assert.equal(replayCall.order.id, firstCall.order.id);

    const state = await listItemsService();
    assert.equal(state.auditLog.length >= 1, true);
  });
});
