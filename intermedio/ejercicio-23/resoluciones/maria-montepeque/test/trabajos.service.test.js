import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import * as trabajosService from "../src/services/trabajos.service.js";
import { resetDb } from "../src/data/db.js";

describe("trabajos.service", () => {
    // cada test empieza con los datos iniciales, asi no dependen uno del otro
    beforeEach(() => {
        resetDb();
    });

    it("lista todos los trabajos", () => {
        assert.equal(trabajosService.findAll().length, 2);
    });

    it("filtra por estado", () => {
        const pendientes = trabajosService.findAll("pendiente");
        assert.equal(pendientes.length, 1);
        assert.equal(pendientes[0].cliente, "Herreria El Yunque");
    });

    it("crea un trabajo pendiente con el costo calculado", () => {
        const nuevo = trabajosService.create({ cliente: " Metal Sur ", proceso: "MIG", material: "aluminio", metros: 2 });

        assert.deepEqual(nuevo, {
            id: 3,
            cliente: "Metal Sur",
            proceso: "MIG",
            material: "aluminio",
            metros: 2,
            costo: 180,
            estado: "pendiente"
        });
        assert.equal(trabajosService.findAll().length, 3);
    });

    it("despues del reset el trabajo creado ya no esta", () => {
        assert.equal(trabajosService.findAll().length, 2);
    });

    it("pide cliente", () => {
        assert.throws(() => trabajosService.create({ proceso: "MIG", material: "acero", metros: 1 }), { statusCode: 400 });
    });

    it("pasa de pendiente a en_proceso a terminado", () => {
        trabajosService.cambiarEstado(2, { estado: "en_proceso" });
        const trabajo = trabajosService.cambiarEstado(2, { estado: "terminado" });
        assert.equal(trabajo.estado, "terminado");
    });

    it("no deja saltar de pendiente a terminado (409)", () => {
        assert.throws(() => trabajosService.cambiarEstado(2, { estado: "terminado" }), { statusCode: 409 });
    });

    it("un trabajo terminado ya no cambia", () => {
        assert.throws(
            () => trabajosService.cambiarEstado(1, { estado: "cancelado" }),
            { statusCode: 409, message: "No se puede pasar de terminado a cancelado" }
        );
    });

    it("404 si el trabajo no existe", () => {
        assert.throws(() => trabajosService.findById(99), { statusCode: 404 });
    });
});
