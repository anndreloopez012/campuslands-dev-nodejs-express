import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { crearApp } from "../src/app.js";

// 1 recepcion, 2 tatuador, 3 auditora, 4 admin
const como = (app, usuario) => ({
    get: (url) => request(app).get(url).set("X-Usuario-Id", String(usuario)),
    post: (url, body) => request(app).post(url).set("X-Usuario-Id", String(usuario)).send(body),
    patch: (url, body) => request(app).patch(url).set("X-Usuario-Id", String(usuario)).send(body),
    put: (url, body) => request(app).put(url).set("X-Usuario-Id", String(usuario)).send(body),
    delete: (url) => request(app).delete(url).set("X-Usuario-Id", String(usuario))
});

const nuevaCita = { cliente: "Valeria", diseno: "Quetzal en el brazo", fecha: "2026-12-01T15:00:00Z", tatuadorId: 2 };

describe("que se audita", () => {
    it("crear y reprogramar: quien, que, cuando, ip, requestId y solo lo que cambio", async () => {
        const app = crearApp();
        await como(app, 1).post("/api/citas", nuevaCita);
        const cambio = await como(app, 2).patch("/api/citas/1/fecha", { fecha: "2026-12-05T15:00:00Z", motivo: "el cliente se enfermo" });

        const [crear, reprogramar] = app.locals.auditoria.buscar();
        assert.equal(crear.accion, "citas.crear");
        assert.equal(crear.actor.nombre, "Rosa (recepcion)");

        assert.equal(reprogramar.actor.rol, "tatuador");
        assert.equal(reprogramar.motivo, "el cliente se enfermo");
        assert.deepEqual(reprogramar.cambios, { fecha: { antes: "2026-12-01T15:00:00Z", despues: "2026-12-05T15:00:00Z" } });
        assert.equal(reprogramar.requestId, cambio.headers["x-request-id"]);
        assert.ok(reprogramar.ip);
    });

    it("los intentos denegados tambien quedan", async () => {
        const app = crearApp();
        await como(app, 1).post("/api/citas", nuevaCita);
        const res = await como(app, 2).post("/api/citas/1/cancelar", {});

        assert.equal(res.status, 403);
        const intento = app.locals.auditoria.buscar({ resultado: "denegado" })[0];
        assert.equal(intento.accion, "citas.cancelar");
        assert.equal(intento.actor.id, 2);
        assert.match(intento.motivo, /tatuador no puede/);
    });

    it("los datos de salud se registran en la cita pero NO quedan en la auditoria", async () => {
        const app = crearApp();
        await como(app, 1).post("/api/citas", nuevaCita);
        const res = await como(app, 2).put("/api/citas/1/salud", { alergias: "latex y tinta roja" });

        assert.equal(res.body.data.alergias, "latex y tinta roja");
        const entrada = app.locals.auditoria.buscar({ accion: "citas.registrar_salud" })[0];
        assert.deepEqual(entrada.cambios, { alergias: { antes: undefined, despues: "[OCULTO]" } });
        assert.doesNotMatch(JSON.stringify(app.locals.auditoria.exportar()), /latex/);
    });

    it("las peticiones sin identificarse quedan como anonimo", async () => {
        const app = crearApp();
        await request(app).post("/api/citas").send(nuevaCita);
        assert.equal(app.locals.auditoria.buscar({ accion: "acceso" })[0].actor.nombre, "anonimo");
    });
});

describe("consultar la auditoria", () => {
    it("solo auditor o admin; consultar tambien queda auditado", async () => {
        const app = crearApp();
        await como(app, 1).post("/api/citas", nuevaCita);

        assert.equal((await como(app, 1).get("/api/auditoria")).status, 403);

        const res = await como(app, 3).get("/api/auditoria?recursoTipo=cita&recursoId=1");
        assert.equal(res.status, 200);
        assert.equal(res.body.total, 1);

        const consultas = app.locals.auditoria.buscar({ accion: "auditoria.consultar", resultado: "exito" });
        assert.equal(consultas.length, 1);
        assert.equal(consultas[0].actor.nombre, "Laura (auditora)");
    });

    it("filtrar por actor y por accion", async () => {
        const app = crearApp();
        await como(app, 1).post("/api/citas", nuevaCita);
        await como(app, 4).post("/api/citas", nuevaCita);
        await como(app, 4).post("/api/citas/2/cancelar", { motivo: "duplicada" });

        const deMario = (await como(app, 3).get("/api/auditoria?actorId=4")).body.data;
        assert.deepEqual(deMario.map((e) => e.accion), ["citas.crear", "citas.cancelar"]);
    });

    it("verificar la cadena con todo lo que paso", async () => {
        const app = crearApp();
        await como(app, 1).post("/api/citas", nuevaCita);
        await como(app, 2).patch("/api/citas/1/fecha", { fecha: "2026-12-09", motivo: "cambio" });
        await como(app, 2).post("/api/citas/1/cancelar", {});

        const res = await como(app, 3).get("/api/auditoria/verificar");
        assert.equal(res.body.data.valido, true);
        assert.equal(res.body.data.entradas, 3);
    });

    it("no se puede borrar ni editar la auditoria (405) y el intento queda", async () => {
        const app = crearApp();
        const res = await como(app, 4).delete("/api/auditoria");
        assert.equal(res.status, 405);
        assert.equal(res.headers.allow, "GET");
        assert.equal(app.locals.auditoria.buscar({ accion: "auditoria.intento_modificar" }).length, 1);
    });
});

describe("validaciones", () => {
    it("400 al reprogramar sin motivo y 409 sobre una cancelada", async () => {
        const app = crearApp();
        await como(app, 1).post("/api/citas", nuevaCita);
        assert.equal((await como(app, 1).patch("/api/citas/1/fecha", { fecha: "2026-12-09" })).status, 400);

        await como(app, 1).post("/api/citas/1/cancelar", {});
        assert.equal((await como(app, 1).patch("/api/citas/1/fecha", { fecha: "2026-12-09", motivo: "x y z" })).status, 409);
        // los rechazos por validacion no son acciones: no se auditan
        assert.equal(app.locals.auditoria.total(), 2);
    });
});
