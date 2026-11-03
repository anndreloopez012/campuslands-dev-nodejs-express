import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { crearApp } from "../src/app.js";

// usuarios: 1 Sara alumna, 2 Hugo alumno con restriccion, 3 Ines instructora de 1 y 2,
// 4 Rafa instructor sin alumnos y rigger, 5 Diana jefa, 6 Tomas instructor vencido
const como = (app, id) => ({
    get: (url) => request(app).get(url).set("X-Usuario-Id", String(id)),
    post: (url, body) => request(app).post(url).set("X-Usuario-Id", String(id)).send(body)
});

describe("ver saltos: cada uno ve segun su alcance", () => {
    it("alumna ve solo los suyos, instructora los de sus alumnos, jefa todos", async () => {
        const app = crearApp();
        const ids = async (usuario) => (await como(app, usuario).get("/api/saltos")).body.data.map((s) => s.id);

        assert.deepEqual(await ids(1), [1]);
        assert.deepEqual(await ids(3), [1, 2]);
        assert.deepEqual(await ids(4), [3]);
        assert.deepEqual(await ids(5), [1, 2, 3]);
    });

    it("pedir un salto ajeno da 403 con el motivo", async () => {
        const res = await como(crearApp(), 1).get("/api/saltos/2");
        assert.equal(res.status, 403);
        assert.match(res.body.motivo, /no esta en su alcance/);
    });
});

describe("aprobar saltos", () => {
    it("la instructora aprueba el de su alumna", async () => {
        const res = await como(crearApp(), 3).post("/api/saltos/1/aprobar");
        assert.equal(res.status, 200);
        assert.equal(res.body.regla, "saltos:aprobar:mis_alumnos");
    });

    it("un instructor no aprueba a alumnos que no son suyos", async () => {
        assert.equal((await como(crearApp(), 4).post("/api/saltos/1/aprobar")).status, 403);
    });

    it("el instructor vencido ya no puede (aunque siga teniendo alumnos asignados)", async () => {
        const res = await como(crearApp(), 6).post("/api/saltos/1/aprobar");
        assert.equal(res.status, 403);
        assert.match(res.body.motivo, /ninguno de sus roles \(alumno\)/);
    });

    it("nadie aprueba su propio salto, ni la jefa", async () => {
        const app = crearApp();
        await como(app, 5).post("/api/saltos", { altitud: 4000, fecha: "2026-11-01" });
        const res = await como(app, 5).post("/api/saltos/4/aprobar");
        assert.equal(res.status, 403);
        assert.equal(res.body.motivo, "conflicto de interes");
    });

    it("aprobar dos veces da 409", async () => {
        const app = crearApp();
        await como(app, 3).post("/api/saltos/1/aprobar");
        assert.equal((await como(app, 3).post("/api/saltos/1/aprobar")).status, 409);
    });
});

describe("negaciones", () => {
    it("Hugo tiene el rol alumno pero una restriccion medica no lo deja registrar saltos", async () => {
        const res = await como(crearApp(), 2).post("/api/saltos", { altitud: 4000, fecha: "2026-11-01" });
        assert.equal(res.status, 403);
        assert.equal(res.body.motivo, "negado: restriccion medica hasta nuevo examen");
    });

    it("pero si puede ver sus saltos", async () => {
        assert.equal((await como(crearApp(), 2).get("/api/saltos/2")).status, 200);
    });
});

describe("varios roles", () => {
    it("Rafa (instructor + rigger) inspecciona equipo; Ines (solo instructora) no", async () => {
        const app = crearApp();
        assert.equal((await como(app, 4).post("/api/equipo/1/inspeccionar")).status, 200);
        assert.equal((await como(app, 3).post("/api/equipo/1/inspeccionar")).status, 403);
    });
});

describe("asignar roles", () => {
    it("la jefa le da rigger temporal a Sara y Sara puede inspeccionar", async () => {
        const app = crearApp();
        const res = await como(app, 5).post("/api/usuarios/1/roles", { rol: "rigger", venceEn: "2099-01-01T00:00:00Z" });
        assert.equal(res.status, 201);
        assert.deepEqual(res.body.data.rolesEfectivos.sort(), ["alumno", "rigger"]);
        assert.equal((await como(app, 1).post("/api/equipo/2/inspeccionar")).status, 200);
    });

    it("un instructor no puede dar roles", async () => {
        assert.equal((await como(crearApp(), 3).post("/api/usuarios/1/roles", { rol: "alumno" })).status, 403);
    });

    it("rol que no existe da 400", async () => {
        assert.equal((await como(crearApp(), 5).post("/api/usuarios/1/roles", { rol: "dios" })).status, 400);
    });
});

describe("explicar y /api/yo", () => {
    it("explica por que si o por que no", async () => {
        const app = crearApp();
        const si = await como(app, 3).get("/api/permisos/explicar?accion=saltos:aprobar&saltoId=1");
        const no = await como(app, 3).get("/api/permisos/explicar?accion=saltos:aprobar&saltoId=3");

        assert.equal(si.body.data.permitido, true);
        assert.equal(si.body.data.motivo, "permitido por saltos:aprobar:mis_alumnos");
        assert.equal(no.body.data.permitido, false);
    });

    it("/api/yo muestra roles asignados, efectivos y permisos", async () => {
        const res = await como(crearApp(), 5).get("/api/yo");
        assert.deepEqual(res.body.data.rolesEfectivos.sort(), ["alumno", "instructor", "jefe_dz", "rigger"]);
        assert.ok(res.body.data.permisos.includes("usuarios:asignar_rol:todos"));
    });

    it("sin X-Usuario-Id da 401", async () => {
        assert.equal((await request(crearApp()).get("/api/yo")).status, 401);
    });
});
