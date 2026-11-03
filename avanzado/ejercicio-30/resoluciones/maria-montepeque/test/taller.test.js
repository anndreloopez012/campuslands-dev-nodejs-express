import { describe, it } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import request from "supertest";
import { ordenEnReparacion, prepararTaller } from "./ayuda.js";

describe("autenticacion", () => {
    it("login correcto da un JWT con el rol", async () => {
        const { app } = await prepararTaller();
        const res = await request(app).post("/api/auth/login").send({ usuario: "beto", clave: "mecanico123" });
        assert.equal(res.status, 200);
        assert.equal(jwt.decode(res.body.data.token).rol, "mecanico");
        assert.equal(res.body.data.usuario.clave, undefined);
    });

    it("usuario que no existe y clave mala dan el mismo 401", async () => {
        const { app } = await prepararTaller();
        const a = await request(app).post("/api/auth/login").send({ usuario: "nadie", clave: "x" });
        const b = await request(app).post("/api/auth/login").send({ usuario: "beto", clave: "mala" });
        assert.deepEqual([a.status, a.body.message], [401, "Usuario o clave incorrectos"]);
        assert.deepEqual([b.status, b.body.message], [401, a.body.message]);
    });

    it("401 sin token, con token falso o con token firmado con otro secreto", async () => {
        const { app } = await prepararTaller();
        assert.equal((await request(app).get("/api/ordenes")).status, 401);
        assert.equal((await request(app).get("/api/ordenes").set("Authorization", "Bearer basura")).status, 401);
        const falso = jwt.sign({ rol: "admin" }, "otro-secreto-de-un-atacante-muy-largo", { subject: "3", issuer: "taller-motos" });
        assert.equal((await request(app).get("/api/ordenes").set("Authorization", `Bearer ${falso}`)).status, 401);
    });

    it("403 cuando el rol no puede", async () => {
        const { como } = await prepararTaller();
        assert.equal((await como("mecanico").post("/api/ordenes", { motoId: 1, problema: "No arranca en las mananas", kilometraje: 100 })).status, 403);
        assert.equal((await como("recepcion").patch("/api/repuestos/1/stock", { cantidad: 5, motivo: "compra" })).status, 403);
    });
});

describe("flujo completo de una orden", () => {
    it("recibida -> diagnostico -> repuestos -> reparacion -> lista -> pago -> entregada", async () => {
        const { como, store } = await prepararTaller();
        const id = await ordenEnReparacion(como, 1);

        await como("mecanico").post(`/api/ordenes/${id}/repuestos`, { repuestoId: 2, cantidad: 1 });
        await como("mecanico").post(`/api/ordenes/${id}/repuestos`, { repuestoId: 3, cantidad: 2 });
        // al agregar, el repuesto queda RESERVADO (todavia no sale de bodega)
        assert.deepEqual([store.repuestos[2].stock, store.repuestos[2].reservado], [30, 2]);

        await como("mecanico").post(`/api/ordenes/${id}/mano-de-obra`, { horas: 1.5, descripcion: "Cambio de pastillas y aceite" });
        const lista = await como("mecanico").post(`/api/ordenes/${id}/estado`, { estado: "lista" });
        assert.deepEqual(lista.body.data.totales, { repuestos: 25000, manoDeObra: 22500, subtotal: 47500, iva: 5700, total: 53200 });

        // no se entrega sin pagar
        assert.equal((await como("recepcion").post(`/api/ordenes/${id}/estado`, { estado: "entregada" })).status, 409);

        const pago = await como("recepcion").post(`/api/ordenes/${id}/pago`, { monto: 53200, metodo: "tarjeta" }, { "Idempotency-Key": "pago-orden-1-abc" });
        assert.equal(pago.status, 201);

        const entregada = await como("recepcion").post(`/api/ordenes/${id}/estado`, { estado: "entregada" });
        assert.equal(entregada.body.data.estado, "entregada");
        // al entregar, lo reservado sale de bodega
        assert.deepEqual([store.repuestos[2].stock, store.repuestos[2].reservado, store.repuestos[1].stock], [28, 0, 9]);

        const historial = (await como("admin").get(`/api/ordenes/${id}/historial`)).body.data;
        assert.deepEqual(historial.map((h) => h.accion), ["orden.creada", "orden.estado", "orden.estado", "orden.repuesto", "orden.repuesto", "orden.mano_de_obra", "orden.estado", "orden.pagada", "orden.estado"]);
        assert.equal(historial.at(-1).usuario.nombre, "Rosa Pineda");
    });

    it("no se marca lista sin mano de obra", async () => {
        const { como } = await prepararTaller();
        const id = await ordenEnReparacion(como);
        const res = await como("mecanico").post(`/api/ordenes/${id}/estado`, { estado: "lista" });
        assert.deepEqual([res.status, res.body.message], [409, "Registra la mano de obra antes de marcarla como lista"]);
    });

    it("una moto no puede tener dos ordenes abiertas", async () => {
        const { como } = await prepararTaller();
        await ordenEnReparacion(como, 2);
        const res = await como("recepcion").post("/api/ordenes", { motoId: 2, problema: "Otra falla distinta aqui", kilometraje: 100 });
        assert.equal(res.status, 409);
    });
});

describe("inventario", () => {
    it("409 si no hay suficientes disponibles (contando lo reservado por otra orden)", async () => {
        const { como } = await prepararTaller();
        const a = await ordenEnReparacion(como, 1);
        const b = await ordenEnReparacion(como, 2);
        // kit de arrastre: stock 4
        assert.equal((await como("mecanico").post(`/api/ordenes/${a}/repuestos`, { repuestoId: 1, cantidad: 3 })).status, 200);
        const res = await como("mecanico").post(`/api/ordenes/${b}/repuestos`, { repuestoId: 1, cantidad: 2 });
        assert.deepEqual([res.status, res.body.message], [409, 'Solo hay 1 de "Kit de arrastre" disponibles']);
    });

    it("cancelar la orden devuelve lo reservado (y pide motivo)", async () => {
        const { como, store } = await prepararTaller();
        const { body } = await como("recepcion").post("/api/ordenes", { motoId: 3, problema: "Revisar luces y bujia", kilometraje: 40000 });
        await como("mecanico").post(`/api/ordenes/${body.data.id}/estado`, { estado: "diagnostico" });
        await como("mecanico").post(`/api/ordenes/${body.data.id}/repuestos`, { repuestoId: 4, cantidad: 2 });
        assert.equal(store.repuestos[3].reservado, 2);

        assert.equal((await como("recepcion").post(`/api/ordenes/${body.data.id}/estado`, { estado: "cancelada" })).status, 400);
        await como("recepcion").post(`/api/ordenes/${body.data.id}/estado`, { estado: "cancelada", nota: "El cliente ya no quiso" });
        assert.equal(store.repuestos[3].reservado, 0);
    });

    it("bajo stock y ajuste solo para admin", async () => {
        const { como } = await prepararTaller();
        const bajos = (await como("mecanico").get("/api/repuestos?bajoStock=true")).body.data.map((r) => r.nombre);
        assert.deepEqual(bajos, ["Bujia NGK", "Filtro de aire"]);

        const res = await como("admin").patch("/api/repuestos/4/stock", { cantidad: 10, motivo: "compra al proveedor" });
        assert.deepEqual([res.body.data.stock, res.body.data.bajoStock], [13, false]);
    });
});

describe("pago idempotente", () => {
    async function ordenLista(como) {
        const id = await ordenEnReparacion(como);
        await como("mecanico").post(`/api/ordenes/${id}/mano-de-obra`, { horas: 2, descripcion: "Ajuste de carburador" });
        await como("mecanico").post(`/api/ordenes/${id}/estado`, { estado: "lista" });
        return id; // total: 2 * 15000 = 30000 + 3600 iva = 33600
    }

    it("repetir el pago con la misma llave no cobra dos veces", async () => {
        const { como, store } = await prepararTaller();
        const id = await ordenLista(como);
        const pagar = () => como("recepcion").post(`/api/ordenes/${id}/pago`, { monto: 33600, metodo: "efectivo" }, { "Idempotency-Key": "caja-1-000123" });

        const primero = await pagar();
        const segundo = await pagar();
        assert.deepEqual([primero.status, segundo.status], [201, 200]);
        assert.equal(segundo.headers["idempotency-replayed"], "true");
        assert.deepEqual(segundo.body.data.pago, primero.body.data.pago);
        assert.equal(store.auditoria.filter((e) => e.accion === "orden.pagada").length, 1);
    });

    it("400 sin llave o con monto distinto al total, 422 si reusa la llave con otro monto", async () => {
        const { como } = await prepararTaller();
        const id = await ordenLista(como);
        assert.equal((await como("recepcion").post(`/api/ordenes/${id}/pago`, { monto: 33600, metodo: "efectivo" })).status, 400);
        const mal = await como("recepcion").post(`/api/ordenes/${id}/pago`, { monto: 30000, metodo: "efectivo" }, { "Idempotency-Key": "caja-1-000999" });
        assert.match(mal.body.message, /33600/);

        await como("recepcion").post(`/api/ordenes/${id}/pago`, { monto: 33600, metodo: "efectivo" }, { "Idempotency-Key": "caja-1-000124" });
        assert.equal((await como("recepcion").post(`/api/ordenes/${id}/pago`, { monto: 1, metodo: "efectivo" }, { "Idempotency-Key": "caja-1-000124" })).status, 422);
    });
});

describe("motos y listados", () => {
    it("crear moto normaliza la placa y valida todo junto", async () => {
        const { como } = await prepararTaller();
        const ok = await como("recepcion").post("/api/motos", { clienteId: 2, marca: "Bajaj", modelo: "Pulsar NS200", anio: 2023, placa: "m 321-xyz", cilindraje: 199 });
        assert.equal(ok.body.data.placa, "M321XYZ");
        const mal = await como("recepcion").post("/api/motos", { clienteId: 99, marca: "B", anio: 1900, placa: "P123", cilindraje: 10 });
        assert.equal(mal.body.errors.length, 6);
        assert.equal((await como("recepcion").post("/api/motos", { clienteId: 1, marca: "Honda", modelo: "XR150", anio: 2020, placa: "M123ABC", cilindraje: 149 })).status, 409);
    });

    it("paginacion y filtros", async () => {
        const { como } = await prepararTaller();
        const res = await como("recepcion").get("/api/motos?limite=2&pagina=2");
        assert.deepEqual(res.body.paginacion, { pagina: 2, limite: 2, total: 3, paginas: 2 });
        assert.equal(res.body.data.length, 1);
        assert.equal((await como("recepcion").get("/api/motos?marca=honda")).body.data[0].modelo, "CB190R");

        await ordenEnReparacion(como, 1);
        assert.equal((await como("recepcion").get("/api/ordenes?estado=en_reparacion")).body.paginacion.total, 1);
        assert.equal((await como("recepcion").get("/api/ordenes?estado=volando")).status, 400);
    });
});
