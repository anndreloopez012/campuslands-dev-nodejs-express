import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import {
  calculateOrderInvoice,
  createWorkOrderService,
  getWorkOrderByIdService
} from "../src/services/workOrders.service.js";
import { NotFoundError } from "../src/utils/customErrors.js";

describe("Proyecto Integrador Intermedio — Suite de Pruebas del Taller de Motocicletas", () => {
  it("Debe calcular correctamente el costo de mano de obra y factura total (billing)", () => {
    const invoice = calculateOrderInvoice(
      {
        id: "ORD-01",
        plateNumber: "S1000RR",
        laborHours: 3,
        partsCostUsd: 100
      },
      70
    );

    assert.equal(invoice.billing.laborCostUsd, 210);
    assert.equal(invoice.billing.totalInvoiceUsd, 310);
  });

  it("Debe crear una orden mecánica usando inyección de repositorio mockeado", async () => {
    const fakeRepo = {
      findAll: mock.fn(async () => [{ id: "ORD-01" }]),
      save: mock.fn(async (data) => data)
    };

    const created = await createWorkOrderService(
      {
        plateNumber: "kaw-zx10r",
        bikeModel: "Kawasaki Ninja ZX-10R",
        engineCc: 998,
        serviceType: "Sincronizacion_Inyeccion",
        laborHours: 2,
        partsCostUsd: 80
      },
      { repo: fakeRepo }
    );

    assert.equal(created.id, "ORD-02");
    assert.equal(created.plateNumber, "KAW-ZX10R");
    assert.equal(fakeRepo.save.mock.callCount(), 1);
  });

  it("Debe rechazar con NotFoundError (404) cuando la orden mecánica no existe", async () => {
    const fakeRepo = {
      findById: mock.fn(async () => null)
    };

    await assert.rejects(
      async () => {
        await getWorkOrderByIdService("ORD-999", { repo: fakeRepo });
      },
      (err) => err instanceof NotFoundError && err.statusCode === 404
    );
  });
});
