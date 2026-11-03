import { describe, it, beforeEach, mock } from "node:test";
import assert from "node:assert/strict";
import { crearCompuestosService } from "../src/services/compuestos.service.js";

// tabla chiquita y con numeros redondos para que las cuentas sean faciles
const TABLA_FALSA = { H: 1, O: 16, C: 12, Na: 23, Cl: 35.5 };

// reloj fijo para que la fecha siempre sea la misma
const FECHA_FIJA = new Date("2026-01-15T12:00:00.000Z");

describe("compuestos.service", () => {
    let repo;
    let service;

    beforeEach(() => {
        // repo falso: cada metodo es un mock.fn, asi puedo ver con que lo llamaron
        repo = {
            listar: mock.fn(async () => []),
            buscarPorFormula: mock.fn(async () => null),
            guardar: mock.fn(async (datos) => ({ id: 1, ...datos }))
        };

        service = crearCompuestosService({ repo, tablaPeriodica: TABLA_FALSA, reloj: () => FECHA_FIJA });
    });

    describe("masaMolar", () => {
        it("suma masa atomica por cantidad", () => {
            const resultado = service.masaMolar("H2O");

            assert.equal(resultado.masaMolar, 18);
            assert.equal(resultado.unidad, "g/mol");
            assert.deepEqual(resultado.detalle, [
                { elemento: "H", cantidad: 2, masaAtomica: 1, aporte: 2 },
                { elemento: "O", cantidad: 1, masaAtomica: 16, aporte: 16 }
            ]);
        });

        it("funciona con parentesis y decimales", () => {
            // C6H12O6 = 72 + 12 + 96
            assert.equal(service.masaMolar("C6H12O6").masaMolar, 180);
            assert.equal(service.masaMolar("NaCl").masaMolar, 58.5);
        });

        it("da 422 si un elemento no esta en la tabla", () => {
            assert.throws(() => service.masaMolar("Fe2O3"), { statusCode: 422, message: "No tengo la masa de: Fe" });
        });

        it("deja pasar el error 400 de una formula mal escrita", () => {
            assert.throws(() => service.masaMolar("H2O)"), { statusCode: 400 });
        });

        it("no usa el repo para calcular", () => {
            service.masaMolar("H2O");
            assert.equal(repo.buscarPorFormula.mock.callCount(), 0);
            assert.equal(repo.guardar.mock.callCount(), 0);
        });
    });

    describe("registrar", () => {
        it("busca duplicado y guarda con la masa y la fecha del reloj", async () => {
            const resultado = await service.registrar({ nombre: " Sal de mesa ", formula: "NaCl" });

            assert.equal(repo.buscarPorFormula.mock.callCount(), 1);
            assert.deepEqual(repo.buscarPorFormula.mock.calls[0].arguments, ["NaCl"]);

            assert.equal(repo.guardar.mock.callCount(), 1);
            assert.deepEqual(repo.guardar.mock.calls[0].arguments[0], {
                nombre: "Sal de mesa",
                formula: "NaCl",
                masaMolar: 58.5,
                registrado: "2026-01-15T12:00:00.000Z"
            });

            assert.equal(resultado.id, 1);
        });

        it("da 409 si la formula ya existe y no guarda", async () => {
            // cambio lo que responde el mock solo para este test
            repo.buscarPorFormula.mock.mockImplementation(async () => ({ id: 7, nombre: "Agua", formula: "H2O" }));

            await assert.rejects(service.registrar({ nombre: "Agua 2", formula: "H2O" }), {
                statusCode: 409,
                message: "H2O ya esta registrado como Agua"
            });
            assert.equal(repo.guardar.mock.callCount(), 0);
        });

        it("valida antes de tocar el repo", async () => {
            await assert.rejects(service.registrar({ formula: "H2O" }), { statusCode: 400, message: "nombre es obligatorio" });
            await assert.rejects(service.registrar({ nombre: "Rara", formula: "Xx2" }), { statusCode: 422 });
            await assert.rejects(service.registrar(undefined), { statusCode: 400 });

            assert.equal(repo.buscarPorFormula.mock.callCount(), 0);
            assert.equal(repo.guardar.mock.callCount(), 0);
        });

        it("si el repo falla el error sube tal cual", async () => {
            repo.guardar.mock.mockImplementation(async () => {
                throw new Error("se cayo la base de datos");
            });

            await assert.rejects(service.registrar({ nombre: "Agua", formula: "H2O" }), {
                message: "se cayo la base de datos"
            });
        });
    });

    describe("listar", () => {
        it("devuelve lo que da el repo", async () => {
            repo.listar.mock.mockImplementation(async () => [{ id: 1, nombre: "Agua" }]);

            assert.deepEqual(await service.listar(), [{ id: 1, nombre: "Agua" }]);
            assert.equal(repo.listar.mock.callCount(), 1);
        });
    });
});
