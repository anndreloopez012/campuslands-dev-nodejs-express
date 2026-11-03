import { test, before } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createStore } from "../../core/store.js";
import { createLogger } from "../../core/logger.js";
import { createWorkOrdersService } from "./work-orders.service.js";

let service;

before(async () => {
    const dir = await mkdtemp(join(tmpdir(), "taller-"));
    const store = await createStore({ file: join(dir, "db.json"), seedFile: new URL("../../../data/seed.json", import.meta.url), logger: createLogger({ level: "error" }) });
    service = createWorkOrdersService(store, { laborRate: 40000, log: createLogger({ level: "error" }) });
});

test("crea una orden en estado received", () => {
    const order = service.create({ motorcycleId: 1, serviceCodes: ["OIL", "BRK"], complaint: "frena mal" });
    assert.equal(order.status, "received");
    assert.equal(order.history.length, 1);
});

test("rechaza una segunda orden abierta para la misma moto", () => {
    assert.throws(() => service.create({ motorcycleId: 1, serviceCodes: ["OIL"], complaint: "otra" }), { status: 409 });
});

test("rechaza codigos de servicio desconocidos con 422", () => {
    assert.throws(() => service.create({ motorcycleId: 2, serviceCodes: ["XXX"], complaint: "x" }), (e) => e.status === 422 && e.details[0].message.includes("XXX"));
});

test("solo permite transiciones validas", () => {
    assert.throws(() => service.changeStatus(2, { status: "ready" }), { status: 409 });
    assert.equal(service.changeStatus(2, { status: "diagnosing" }).status, "diagnosing");
    assert.equal(service.changeStatus(2, { status: "in_repair" }).status, "in_repair");
    assert.equal(service.changeStatus(2, { status: "ready" }).status, "ready");
});

test("la factura suma mano de obra, repuestos e IVA", () => {
    const invoice = service.invoice(2);
    assert.equal(invoice.subtotal, 0.5 * 40000 + 65000 + 1 * 40000 + 90000);
    assert.equal(invoice.total, invoice.subtotal + Math.round(invoice.subtotal * 0.19));
});
