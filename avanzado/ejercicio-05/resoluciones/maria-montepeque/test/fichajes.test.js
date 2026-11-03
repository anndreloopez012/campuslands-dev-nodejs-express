import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { crearApp } from "../src/app.js";
import { PASOS } from "../src/servicios/fichajes.servicio.js";

let app;
beforeEach(() => {
    app = crearApp();
});

const fichar = (body, fallo) => {
    const req = request(app).post("/api/fichajes");
    if (fallo) req.set("X-Simular-Fallo", fallo);
    return req.send(body);
};

const consistencia = async (a = app) => (await request(a).get("/api/consistencia")).body.data;
const presupuesto = async (id, a = app) => (await request(a).get(`/api/clubes/${id}`)).body.data.presupuesto;

describe("fichaje que sale bien", () => {
    it("mueve el dinero, el jugador y deja todo anotado", async () => {
        const res = await fichar({ jugadorId: 3, clubDestinoId: 1, monto: 500_000 });

        assert.equal(res.status, 201);
        assert.deepEqual(res.body.data, { id: 1, jugadorId: 3, jugador: "Ruben Morales", de: "Municipal", a: "Comunicaciones", monto: 500_000 });

        assert.equal(await presupuesto(1), 1_500_000);
        assert.equal(await presupuesto(2), 2_000_000);

        const comunicaciones = (await request(app).get("/api/clubes/1")).body.data;
        assert.ok(comunicaciones.plantilla.some((j) => j.id === 3 && j.clubId === 1));

        const movimientos = (await request(app).get("/api/movimientos")).body.data;
        assert.equal(movimientos.length, 2);

        const c = await consistencia();
        assert.equal(c.consistente, true);
        assert.equal(c.version, 1);
    });
});

describe("rollback: una falla en cualquier paso no deja nada a medias", () => {
    for (const paso of PASOS) {
        it(`falla despues de "${paso}"`, async () => {
            const antes = (await request(app).get("/api/clubes")).body.data;

            const res = await fichar({ jugadorId: 3, clubDestinoId: 1, monto: 500_000 }, paso);

            assert.equal(res.status, 500);
            assert.equal(res.body.code, "FALLA_SIMULADA");

            // todo igual que antes: presupuestos, plantillas, fichajes y movimientos
            assert.deepEqual((await request(app).get("/api/clubes")).body.data, antes);
            assert.deepEqual((await request(app).get("/api/fichajes")).body.data, []);
            assert.deepEqual((await request(app).get("/api/movimientos")).body.data, []);

            const c = await consistencia();
            assert.equal(c.consistente, true);
            assert.equal(c.version, 0);
        });
    }

    it("despues de una falla el mismo fichaje se puede hacer bien", async () => {
        await fichar({ jugadorId: 3, clubDestinoId: 1, monto: 500_000 }, "mover-jugador");
        const res = await fichar({ jugadorId: 3, clubDestinoId: 1, monto: 500_000 });
        assert.equal(res.status, 201);
    });

    it("en produccion el header de simulacion se ignora", async () => {
        const prod = crearApp({ permitirSimulacion: false });
        const res = await request(prod).post("/api/fichajes").set("X-Simular-Fallo", "mover-jugador").send({ jugadorId: 3, clubDestinoId: 1, monto: 1 });
        assert.equal(res.status, 201);
    });
});

describe("reglas del fichaje (fallan antes de cambiar algo)", () => {
    const casos = [
        [{ jugadorId: 3, clubDestinoId: 1, monto: 9_000_000 }, 422, "PRESUPUESTO_INSUFICIENTE"],
        [{ jugadorId: 1, clubDestinoId: 3, monto: 1000 }, 422, "PLANTILLA_LLENA"],
        [{ jugadorId: 8, clubDestinoId: 1, monto: 1000 }, 422, "MODALIDAD_DISTINTA"],
        [{ jugadorId: 1, clubDestinoId: 1, monto: 1000 }, 409, "MISMO_CLUB"],
        [{ jugadorId: 99, clubDestinoId: 1, monto: 1000 }, 404, "JUGADOR_NO_ENCONTRADO"],
        [{ jugadorId: 1, clubDestinoId: 99, monto: 1000 }, 404, "CLUB_NO_ENCONTRADO"],
        [{ jugadorId: "1", clubDestinoId: 2, monto: -5 }, 400, "DATOS_INVALIDOS"]
    ];

    for (const [body, status, code] of casos) {
        it(`${code} -> ${status}`, async () => {
            const res = await fichar(body);
            assert.equal(res.status, status);
            assert.equal(res.body.code, code);
            assert.equal((await consistencia()).version, 0);
        });
    }

    it("PRESUPUESTO_INSUFICIENTE dice cuanto hay y cuanto cuesta", async () => {
        // Bufalos (futsal, Q150,000) quiere a Byron de Glucosoral
        const res = await fichar({ jugadorId: 8, clubDestinoId: 5, monto: 200_000 });
        assert.deepEqual(res.body.detalles, { presupuesto: 150_000, monto: 200_000 });
    });

    it("simularFallo con un paso que no existe da 400", async () => {
        const res = await fichar({ jugadorId: 3, clubDestinoId: 1, monto: 1 }, "otro-paso");
        assert.equal(res.status, 400);
    });
});

describe("dos fichajes al mismo tiempo (aislamiento)", () => {
    // Municipal tiene Q1,500,000 y quiere dos jugadores de Q1,000,000 a la vez
    const compraDoble = (a) =>
        Promise.all([
            request(a).post("/api/fichajes").send({ jugadorId: 1, clubDestinoId: 2, monto: 1_000_000 }),
            request(a).post("/api/fichajes").send({ jugadorId: 5, clubDestinoId: 2, monto: 1_000_000 })
        ]);

    it("con candado: uno pasa y el otro ve que ya no alcanza", async () => {
        const respuestas = await compraDoble(app);

        assert.deepEqual(respuestas.map((r) => r.status).sort(), [201, 422]);
        assert.equal(respuestas.find((r) => r.status === 422).body.code, "PRESUPUESTO_INSUFICIENTE");
        assert.equal(await presupuesto(2), 500_000);
        assert.equal((await consistencia()).consistente, true);
    });

    it("sin candado: los dos dicen 201 pero uno se pierde (lost update)", async () => {
        const sinCandado = crearApp({ conCandado: false });
        const respuestas = await compraDoble(sinCandado);

        // los dos creyeron que tenian plata y respondieron 201...
        assert.deepEqual(respuestas.map((r) => r.status), [201, 201]);

        // ...pero cada uno trabajo sobre su propia copia y el segundo commit piso al primero
        const fichajes = (await request(sinCandado).get("/api/fichajes")).body.data;
        assert.equal(fichajes.length, 1);
        assert.equal(await presupuesto(2, sinCandado), 500_000);
    });
});
