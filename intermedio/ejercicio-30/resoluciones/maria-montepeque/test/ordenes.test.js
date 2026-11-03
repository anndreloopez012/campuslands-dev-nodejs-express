import { describe, it, before, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { db, resetDb } from "../src/data/db.js";
import { app, request, todasLasSesiones } from "../test-helpers/sesiones.js";

// atajos para no repetir tanto
let s;
const crearOrden = (motoId, quien = s.recepcion, body = { tipo: "reparacion", descripcion: "Cambio de kit de arrastre" }) =>
    request(app).post(`/api/motos/${motoId}/ordenes`).set(quien).send(body);
const asignar = (id, mecanicoId, quien = s.admin) => request(app).patch(`/api/ordenes/${id}/asignar`).set(quien).send({ mecanicoId });
const estado = (id, nuevo, quien) => request(app).patch(`/api/ordenes/${id}/estado`).set(quien).send({ estado: nuevo });
const repuesto = (id, repuestoId, cantidad, quien) => request(app).post(`/api/ordenes/${id}/repuestos`).set(quien).send({ repuestoId, cantidad });

describe("ordenes de servicio", () => {
    before(async () => {
        resetDb();
        s = await todasLasSesiones();
    });

    beforeEach(() => resetDb());

    it("flujo completo: recepcion abre, admin asigna, mecanico trabaja, recepcion entrega", async () => {
        // 1. recepcion abre la orden de la moto 1
        const creada = await crearOrden(1);
        assert.equal(creada.status, 201);
        assert.equal(creada.headers.location, "/api/ordenes/2");
        assert.equal(creada.body.data.estado, "pendiente");
        assert.equal(creada.body.data.total, 300);
        assert.deepEqual(creada.body.data.moto, { id: 1, placa: "M123ABC", modelo: "Honda CB190R" });

        // 2. admin se la asigna a Beto (id 2)
        assert.equal((await asignar(2, 2)).status, 200);

        // 3. Beto la empieza y le pone repuestos
        assert.equal((await estado(2, "en_proceso", s.beto)).status, 200);
        assert.equal((await repuesto(2, 4, 1, s.beto)).status, 201);
        const conAceite = await repuesto(2, 1, 2, s.beto);
        assert.equal(conAceite.status, 201);

        // 300 de mano de obra + 550 del kit + 2 x 65 de aceite
        assert.equal(conAceite.body.data.totalRepuestos, 680);
        assert.equal(conAceite.body.data.total, 980);

        // 4. Beto la marca lista y recepcion la entrega
        assert.equal((await estado(2, "lista", s.beto)).status, 200);
        const entregada = await estado(2, "entregada", s.recepcion);
        assert.equal(entregada.status, 200);

        // el historial guarda cada paso y quien lo hizo
        assert.deepEqual(
            entregada.body.data.historial.map((h) => [h.estado, h.por]),
            [["pendiente", 1], ["en_proceso", 2], ["lista", 2], ["entregada", 1]]
        );

        // y se desconto el inventario
        assert.equal(db.repuestos.find((r) => r.id === 4).stock, 1);
        assert.equal(db.repuestos.find((r) => r.id === 1).stock, 18);
    });

    it("el mismo repuesto dos veces suma la cantidad en una sola linea", async () => {
        await crearOrden(1);
        await asignar(2, 2);
        await estado(2, "en_proceso", s.beto);
        await repuesto(2, 1, 1, s.beto);
        const res = await repuesto(2, 1, 3, s.beto);

        assert.deepEqual(res.body.data.repuestos, [{ repuestoId: 1, nombre: "Aceite 20W50 (1 litro)", cantidad: 4, precioUnitario: 65 }]);
    });

    it("el precio queda guardado aunque despues cambie en el inventario", async () => {
        await crearOrden(1);
        await asignar(2, 2);
        await estado(2, "en_proceso", s.beto);
        await repuesto(2, 2, 1, s.beto);

        db.repuestos.find((r) => r.id === 2).precio = 999;

        const res = await request(app).get("/api/ordenes/2").set(s.admin);
        assert.equal(res.body.data.repuestos[0].precioUnitario, 45);
    });

    describe("reglas de estado", () => {
        it("no se puede empezar sin mecanico asignado", async () => {
            const res = await estado(1, "en_proceso", s.admin);
            assert.equal(res.status, 409);
            assert.equal(res.body.message, "Primero hay que asignar un mecanico");
        });

        it("no se puede saltar de pendiente a lista", async () => {
            await asignar(1, 2);
            const res = await estado(1, "lista", s.beto);
            assert.equal(res.status, 409);
            assert.equal(res.body.message, 'No se puede pasar de "pendiente" a "lista"');
        });

        it("estado que no existe da 400", async () => {
            assert.equal((await estado(1, "volando", s.admin)).status, 400);
        });

        it("cancelar una pendiente si, una entregada no", async () => {
            assert.equal((await estado(1, "cancelada", s.recepcion)).status, 200);
            assert.equal((await estado(1, "en_proceso", s.admin)).status, 409);
        });

        it("solo una orden abierta por moto, y despues de entregar se puede abrir otra", async () => {
            const segunda = await crearOrden(2);
            assert.equal(segunda.status, 409);
            assert.equal(segunda.body.message, "La moto ya tiene la orden 1 abierta");

            await estado(1, "cancelada", s.recepcion);
            assert.equal((await crearOrden(2)).status, 201);
        });

        it("repuestos solo con la orden en proceso", async () => {
            const res = await repuesto(1, 1, 1, s.admin);
            assert.equal(res.status, 409);
        });

        it("sin stock da 409 y no cambia nada", async () => {
            await asignar(1, 2);
            await estado(1, "en_proceso", s.beto);

            const res = await repuesto(1, 3, 5, s.beto);
            assert.equal(res.status, 409);
            assert.equal(res.body.message, 'Solo hay 4 de "Pastillas de freno" en bodega');

            assert.equal(db.repuestos.find((r) => r.id === 3).stock, 4);
            assert.deepEqual(db.ordenes.find((o) => o.id === 1).repuestos, []);
        });

        it("solo se asigna a usuarios mecanicos", async () => {
            const res = await asignar(1, 1);
            assert.equal(res.status, 400);
        });
    });

    describe("permisos por rol", () => {
        it("mecanico no abre ordenes ni asigna", async () => {
            assert.equal((await crearOrden(1, s.beto)).status, 403);
            assert.equal((await asignar(1, 2, s.beto)).status, 403);
        });

        it("recepcion no asigna, no empieza y no agrega repuestos", async () => {
            await asignar(1, 2);
            assert.equal((await asignar(1, 3, s.recepcion)).status, 403);

            const empezar = await estado(1, "en_proceso", s.recepcion);
            assert.equal(empezar.status, 403);
            assert.equal(empezar.body.message, 'Pasar a "en_proceso" lo hace mecanico o admin');

            assert.equal((await repuesto(1, 1, 1, s.recepcion)).status, 403);
        });

        it("el mecanico no entrega, eso es de recepcion", async () => {
            await asignar(1, 2);
            await estado(1, "en_proceso", s.beto);
            await estado(1, "lista", s.beto);

            assert.equal((await estado(1, "entregada", s.beto)).status, 403);
        });

        it("un mecanico no toca las ordenes de otro", async () => {
            await asignar(1, 2);

            const ver = await request(app).get("/api/ordenes/1").set(s.carla);
            assert.equal(ver.status, 403);
            assert.equal(ver.body.message, "Esta orden no esta asignada a ti");

            assert.equal((await estado(1, "en_proceso", s.carla)).status, 403);
        });

        it("cada mecanico solo ve sus ordenes en la lista", async () => {
            await asignar(1, 2);
            await crearOrden(3);
            await asignar(2, 3);

            const beto = await request(app).get("/api/ordenes").set(s.beto);
            const carla = await request(app).get("/api/ordenes").set(s.carla);
            const admin = await request(app).get("/api/ordenes").set(s.admin);

            assert.deepEqual(beto.body.data.map((o) => o.id), [1]);
            assert.deepEqual(carla.body.data.map((o) => o.id), [2]);
            assert.deepEqual(admin.body.data.map((o) => o.id), [2, 1]);
        });
    });

    describe("consultas", () => {
        it("GET /api/ordenes?estado= filtra y valida", async () => {
            await estado(1, "cancelada", s.recepcion);
            await crearOrden(3);

            const pendientes = await request(app).get("/api/ordenes?estado=pendiente").set(s.admin);
            assert.deepEqual(pendientes.body.data.map((o) => o.id), [2]);
            assert.equal(pendientes.body.meta.total, 1);

            assert.equal((await request(app).get("/api/ordenes?estado=rara").set(s.admin)).status, 400);
        });

        it("GET /api/motos/:id/ordenes es el historial de la moto", async () => {
            const res = await request(app).get("/api/motos/2/ordenes").set(s.recepcion);
            assert.equal(res.status, 200);
            assert.deepEqual(res.body.data.map((o) => o.id), [1]);

            assert.equal((await request(app).get("/api/motos/99/ordenes").set(s.recepcion)).status, 404);
        });

        it("orden que no existe 404 y body invalido 400", async () => {
            assert.equal((await request(app).get("/api/ordenes/99").set(s.admin)).status, 404);

            const malo = await crearOrden(1, s.recepcion, { tipo: "pintura", descripcion: "x" });
            assert.equal(malo.status, 400);
            assert.equal(malo.body.errors.length, 2);
        });
    });

    describe("repuestos", () => {
        it("cualquiera con login los ve, ?sinStock=true filtra", async () => {
            const todos = await request(app).get("/api/repuestos").set(s.beto);
            const sinStock = await request(app).get("/api/repuestos?sinStock=true").set(s.beto);

            assert.equal(todos.body.total, 5);
            assert.deepEqual(sinStock.body.data.map((r) => r.nombre), ["Bujia"]);
        });

        it("solo admin cambia el stock", async () => {
            assert.equal((await request(app).patch("/api/repuestos/5/stock").set(s.recepcion).send({ stock: 10 })).status, 403);

            const ok = await request(app).patch("/api/repuestos/5/stock").set(s.admin).send({ stock: 10 });
            assert.equal(ok.status, 200);
            assert.equal(ok.body.data.stock, 10);

            assert.equal((await request(app).patch("/api/repuestos/5/stock").set(s.admin).send({ stock: -1 })).status, 400);
        });
    });
});
