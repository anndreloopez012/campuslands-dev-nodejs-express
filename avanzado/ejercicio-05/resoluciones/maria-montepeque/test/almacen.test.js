import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { crearAlmacen } from "../src/datos/almacen.js";

// el almacen solo, sin express

describe("crearAlmacen", () => {
    it("commit: si la transaccion termina bien, los cambios quedan", async () => {
        const almacen = crearAlmacen({ cuenta: 10, log: [] });

        await almacen.transaccion(async (db) => {
            db.cuenta -= 3;
            db.log.push("retiro 3");
        });

        assert.deepEqual(almacen.leer(), { cuenta: 7, log: ["retiro 3"] });
        assert.equal(almacen.version(), 1);
    });

    it("rollback: si tira error, no queda NINGUN cambio", async () => {
        const almacen = crearAlmacen({ cuenta: 10, log: [] });

        await assert.rejects(
            almacen.transaccion(async (db) => {
                db.cuenta -= 3;
                db.log.push("retiro 3");
                throw new Error("se cayo a la mitad");
            }),
            /se cayo a la mitad/
        );

        assert.deepEqual(almacen.leer(), { cuenta: 10, log: [] });
        assert.equal(almacen.version(), 0);
    });

    it("lo que devuelve leer() es una copia: cambiarla no cambia el almacen", () => {
        const almacen = crearAlmacen({ cuenta: 10 });
        almacen.leer().cuenta = 999;
        assert.equal(almacen.leer().cuenta, 10);
    });

    it("dentro de la transaccion no se ve nada afuera hasta el commit", async () => {
        const almacen = crearAlmacen({ cuenta: 10 });
        let vistoAfuera;

        await almacen.transaccion(async (db) => {
            db.cuenta = 0;
            vistoAfuera = almacen.leer().cuenta;
        });

        assert.equal(vistoAfuera, 10);
        assert.equal(almacen.leer().cuenta, 0);
    });

    it("con candado las transacciones van de una en una y en orden", async () => {
        const almacen = crearAlmacen({ orden: [] });
        const pausa = () => new Promise((r) => setTimeout(r, 5));

        await Promise.all(
            ["a", "b", "c"].map((letra) =>
                almacen.transaccion(async (db) => {
                    db.orden.push(`${letra}-inicio`);
                    await pausa();
                    db.orden.push(`${letra}-fin`);
                })
            )
        );

        assert.deepEqual(almacen.leer().orden, ["a-inicio", "a-fin", "b-inicio", "b-fin", "c-inicio", "c-fin"]);
    });

    it("un error no deja el candado trabado", async () => {
        const almacen = crearAlmacen({ n: 0 });

        await assert.rejects(almacen.transaccion(async () => {
            throw new Error("falla");
        }));
        await almacen.transaccion(async (db) => {
            db.n = 1;
        });

        assert.equal(almacen.leer().n, 1);
    });
});
