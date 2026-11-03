import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calcularTotal, puedeCambiar, TRANSICIONES } from "../src/services/ordenes.service.js";

describe("maquina de estados", () => {
    it("el camino normal y quien puede hacer cada paso", () => {
        assert.equal(puedeCambiar("recibida", "diagnostico", "mecanico").ok, true);
        assert.equal(puedeCambiar("recibida", "diagnostico", "recepcion").status, 403);
        assert.equal(puedeCambiar("lista", "entregada", "recepcion").ok, true);
        assert.equal(puedeCambiar("lista", "entregada", "mecanico").status, 403);
    });

    it("no se puede saltar pasos ni volver atras", () => {
        assert.equal(puedeCambiar("recibida", "lista", "admin").status, 409);
        assert.equal(puedeCambiar("lista", "en_reparacion", "admin").status, 409);
    });

    it("entregada y cancelada son finales; en reparacion ya no se cancela", () => {
        assert.deepEqual(TRANSICIONES.entregada, {});
        assert.deepEqual(TRANSICIONES.cancelada, {});
        assert.equal(puedeCambiar("en_reparacion", "cancelada", "admin").status, 409);
    });

    it("admin puede hacer cualquier paso valido", () => {
        assert.equal(puedeCambiar("recibida", "diagnostico", "admin").ok, true);
    });
});

describe("totales en centavos", () => {
    it("repuestos + horas * tarifa + IVA 12%", () => {
        const orden = { repuestos: [{ cantidad: 2, precioUnitario: 6500 }, { cantidad: 1, precioUnitario: 12000 }], manoDeObra: [{ horas: 1 }, { horas: 0.5 }] };
        assert.deepEqual(calcularTotal(orden, 15000), { repuestos: 25000, manoDeObra: 22500, subtotal: 47500, iva: 5700, total: 53200 });
    });

    it("una orden vacia da 0", () => {
        assert.equal(calcularTotal({ repuestos: [], manoDeObra: [] }, 15000).total, 0);
    });
});
