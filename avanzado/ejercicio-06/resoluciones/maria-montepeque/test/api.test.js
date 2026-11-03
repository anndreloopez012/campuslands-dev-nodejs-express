import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { crearApp } from "../src/app.js";

let app;
let cola;

beforeEach(() => {
    // tiempos cortos para que los tests sean rapidos
    app = crearApp({ cola: { concurrencia: 2, backoffBaseMs: 5, timeoutMs: 200 }, duracionDiagnosticoMs: 20, duracionNotificacionMs: 5 });
    cola = app.locals.cola;
});

afterEach(async () => {
    await cola.cerrar();
});

const pedir = (body) => request(app).post("/api/diagnosticos").send({ placa: "M123ABC", sintomas: ["luz-aceite", "ruido-cadena"], telefono: "55551234", ...body });

describe("POST /api/diagnosticos", () => {
    it("responde 202 al instante con Location y Retry-After", async () => {
        const inicio = Date.now();
        const res = await pedir();

        assert.equal(res.status, 202);
        assert.equal(res.headers.location, "/api/tareas/1");
        assert.equal(res.headers["retry-after"], "1");
        assert.equal(res.body.data.estado, "pendiente");
        // no espero a que el diagnostico termine
        assert.ok(Date.now() - inicio < 200);
    });

    it("consultando la tarea se ve como avanza hasta tener el resultado", async () => {
        const { body } = await pedir();
        const id = body.data.tareaId;

        const mientras = await request(app).get(`/api/tareas/${id}`);
        assert.ok(["pendiente", "en_proceso"].includes(mientras.body.data.estado));
        assert.equal(mientras.headers["retry-after"], "1");

        await cola.cuandoTermine(id);
        const despues = await request(app).get(`/api/tareas/${id}`);

        assert.equal(despues.body.data.estado, "completada");
        assert.equal(despues.body.data.resultado.total, 255);
        assert.equal(despues.headers["retry-after"], undefined);
    });

    it("al terminar encola la notificacion al cliente y se manda el SMS", async () => {
        const { body } = await pedir();
        const diagnostico = await cola.cuandoTermine(body.data.tareaId);

        const notificacion = await cola.cuandoTermine(diagnostico.resultado.notificacionId);
        assert.equal(notificacion.padreId, diagnostico.id);
        assert.equal(notificacion.prioridad, "baja");

        const sms = await request(app).get("/api/sms-enviados");
        assert.deepEqual(sms.body.data.map((s) => s.mensaje), ["Su moto M123ABC ya fue revisada. Presupuesto: Q255"]);
    });

    it("un fallo pasajero se reintenta solo y termina bien", async () => {
        const { body } = await pedir({ simular: "fallar-2-veces" });
        const final = await cola.cuandoTermine(body.data.tareaId);

        assert.equal(final.estado, "completada");
        assert.equal(final.intentos, 3);
        assert.equal(final.errores.length, 2);
    });

    it("un fallo permanente termina en muertas y se puede reintentar", async () => {
        const { body } = await pedir({ simular: "fallar-siempre" });
        const final = await cola.cuandoTermine(body.data.tareaId);

        assert.equal(final.estado, "fallida");
        const estado = await request(app).get("/api/cola");
        assert.deepEqual(estado.body.data.muertas, [body.data.tareaId]);

        const reintento = await request(app).post(`/api/tareas/${body.data.tareaId}/reintentar`);
        assert.equal(reintento.status, 202);

        // reintentar una que no esta fallida da 409
        const otra = await pedir();
        assert.equal((await request(app).post(`/api/tareas/${otra.body.data.tareaId}/reintentar`)).status, 409);
    });

    it("pausar la cola: los pedidos se aceptan pero esperan", async () => {
        await request(app).post("/api/cola/pausar");
        const { body } = await pedir();

        await new Promise((r) => setTimeout(r, 40));
        assert.equal((await request(app).get(`/api/tareas/${body.data.tareaId}`)).body.data.estado, "pendiente");

        const reanudar = await request(app).post("/api/cola/reanudar");
        assert.equal(reanudar.body.data.pausada, false);
        assert.equal((await cola.cuandoTermine(body.data.tareaId)).estado, "completada");
    });

    it("400 con datos malos (nada entra a la cola)", async () => {
        const res = await request(app)
            .post("/api/diagnosticos")
            .send({ placa: "ABC", sintomas: ["explota", "toString"], telefono: "123", prioridad: "urgente" });

        assert.equal(res.status, 400);
        assert.deepEqual(res.body.errors, [
            "placa debe tener el formato M123ABC",
            "sintomas no conocidos: explota, toString",
            "telefono debe tener 8 numeros",
            "prioridad debe ser alta, normal o baja"
        ]);
        assert.equal(cola.listar().length, 0);
    });

    it("en produccion no se puede pedir una simulacion", async () => {
        const prod = crearApp({ permitirSimulacion: false });
        const res = await request(prod).post("/api/diagnosticos").send({ placa: "M123ABC", sintomas: ["vibracion"], telefono: "55551234", simular: "fallar-siempre" });

        assert.equal(res.status, 400);
        assert.deepEqual(res.body.errors, ["simular no esta permitido"]);
        await prod.locals.cola.cerrar();
    });
});

describe("consultas", () => {
    it("GET /api/tareas?estado= filtra", async () => {
        const { body } = await pedir();
        await cola.cuandoTermine(body.data.tareaId);

        const completadas = await request(app).get("/api/tareas?estado=completada");
        assert.ok(completadas.body.data.some((t) => t.id === body.data.tareaId));
    });

    it("GET /api/cola muestra estadisticas", async () => {
        const res = await request(app).get("/api/cola");
        assert.deepEqual(Object.keys(res.body.data).sort(), ["activas", "concurrencia", "enCola", "muertas", "pausada", "porEstado"]);
    });

    it("404 y 400 al consultar una tarea", async () => {
        assert.equal((await request(app).get("/api/tareas/99")).status, 404);
        assert.equal((await request(app).get("/api/tareas/abc")).status, 400);
    });
});
