import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { crearApp } from "../src/app.js";

let app;
beforeEach(() => {
    app = crearApp({ notificaciones: { demoraMs: 5 } });
});

const pedir = (modelo, a = app) => request(a).post("/api/pedidos").send({ modelo, cliente: "Ana Torres", email: "ana@correo.com" });
const esperar = (ms = 20) => new Promise((r) => setTimeout(r, ms));

describe("pedidos con eventos", () => {
    it("crear publica pedido.creado y el inventario lo confirma antes de responder", async () => {
        const res = await pedir("Koenigsegg Jesko");

        assert.equal(res.status, 201);
        // emit es sincrono: el inventario ya contesto antes de armar la respuesta
        assert.equal(res.body.data.estado, "confirmado");

        const eventos = (await request(app).get("/api/eventos?pedidoId=1")).body.data.map((e) => e.evento);
        assert.deepEqual(eventos, ["pedido.creado", "pedido.confirmado"]);
        assert.equal((await request(app).get("/api/inventario")).body.data["Koenigsegg Jesko"], 0);
    });

    it("sin stock el inventario publica pedido.rechazado con el motivo", async () => {
        await pedir("Rimac Nevera");
        const pedido = (await request(app).get("/api/pedidos/1")).body.data;

        assert.equal(pedido.estado, "rechazado");
        assert.equal(pedido.motivo, "No hay unidades de Rimac Nevera");
    });

    it("las notificaciones llegan despues (son async) sin frenar la respuesta", async () => {
        const lenta = crearApp({ notificaciones: { demoraMs: 100 } });
        const inicio = Date.now();
        await pedir("Pagani Utopia", lenta);

        // la respuesta no espero los 100ms del correo
        assert.ok(Date.now() - inicio < 100);
        assert.deepEqual((await request(lenta).get("/api/notificaciones")).body.data, []);

        await esperar(130);
        const correos = (await request(lenta).get("/api/notificaciones")).body.data;
        assert.deepEqual(correos, [{ para: "ana@correo.com", evento: "pedido.confirmado", texto: "Tu Pagani Utopia esta confirmado. Pronto empieza la fabricacion." }]);
    });

    it("avanzar hasta entregado publica cada evento", async () => {
        await pedir("McLaren W1");
        await request(app).post("/api/pedidos/1/avanzar");
        const final = await request(app).post("/api/pedidos/1/avanzar");

        assert.equal(final.body.data.estado, "entregado");
        const eventos = (await request(app).get("/api/eventos")).body.data.map((e) => e.evento);
        assert.deepEqual(eventos, ["pedido.creado", "pedido.confirmado", "pedido.en_produccion", "pedido.entregado"]);

        assert.equal((await request(app).post("/api/pedidos/1/avanzar")).status, 409);
    });

    it("cancelar un confirmado le devuelve la unidad al inventario", async () => {
        await pedir("Koenigsegg Jesko");
        await request(app).post("/api/pedidos/1/cancelar");

        assert.equal((await request(app).get("/api/inventario")).body.data["Koenigsegg Jesko"], 1);
        assert.equal((await pedir("Koenigsegg Jesko")).status, 201);
        assert.equal((await request(app).get("/api/pedidos/2")).body.data.estado, "confirmado");
    });

    it("si el correo esta caido, el pedido igual se confirma y el error queda en el bus", async () => {
        const conFalla = crearApp({ notificaciones: { demoraMs: 1, servidorCorreoCaido: true } });
        const res = await pedir("Bugatti Chiron", conFalla);
        await esperar();

        assert.equal(res.status, 201);
        assert.equal((await request(conFalla).get("/api/pedidos/1")).body.data.estado, "confirmado");

        const bus = (await request(conFalla).get("/api/bus")).body.data;
        assert.deepEqual(bus.errores.map((e) => [e.suscriptor, e.evento, e.error]), [["notificaciones", "pedido.confirmado", "El servidor de correo no responde"]]);
    });

    it("GET /api/bus muestra cuantos escuchan cada evento", async () => {
        const { suscriptores } = (await request(app).get("/api/bus")).body.data;
        assert.equal(suscriptores["pedido.creado"], 1);
        assert.equal(suscriptores["pedido.confirmado"], 2);
        assert.equal(suscriptores["*"], 1);
    });

    it("400, 404 y 409", async () => {
        const malo = await request(app).post("/api/pedidos").send({ modelo: "Fiat Uno", email: "x" });
        assert.equal(malo.status, 400);
        assert.equal(malo.body.errors.length, 3);
        assert.equal((await request(app).get("/api/pedidos/9")).status, 404);

        await pedir("Rimac Nevera");
        assert.equal((await request(app).post("/api/pedidos/1/cancelar")).status, 409);
    });
});
