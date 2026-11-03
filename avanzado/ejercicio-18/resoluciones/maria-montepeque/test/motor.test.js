import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { puede, rolesEfectivos, permisosEfectivos } from "../src/permisos/motor.js";

const usuario = (roles, extra = {}) => ({ id: 10, roles: roles.map((r) => (typeof r === "string" ? { rol: r } : r)), alumnos: [], negaciones: [], ...extra });

describe("herencia de roles", () => {
    it("jefe_dz hereda de instructor y rigger, e instructor de alumno", () => {
        assert.deepEqual(rolesEfectivos(usuario(["jefe_dz"])).sort(), ["alumno", "instructor", "jefe_dz", "rigger"]);
    });

    it("varios roles se suman", () => {
        const permisos = permisosEfectivos(usuario(["alumno", "rigger"]));
        assert.ok(permisos.includes("saltos:crear:propio"));
        assert.ok(permisos.includes("equipo:inspeccionar:todos"));
    });

    it("un rol vencido no cuenta (ni lo que hereda)", () => {
        const u = usuario([{ rol: "instructor", venceEn: "2026-01-01T00:00:00Z" }]);
        assert.deepEqual(rolesEfectivos(u, Date.parse("2025-12-31")).sort(), ["alumno", "instructor"]);
        assert.deepEqual(rolesEfectivos(u, Date.parse("2026-01-02")), []);
    });
});

describe("puede", () => {
    it("alcance propio: el alumno ve su salto y no el de otro", () => {
        const alumno = usuario(["alumno"]);
        assert.equal(puede(alumno, "saltos:ver", { duenoId: 10 }).permitido, true);
        assert.equal(puede(alumno, "saltos:ver", { duenoId: 99 }).permitido, false);
    });

    it("alcance mis_alumnos: el instructor aprueba solo a los suyos", () => {
        const instructor = usuario(["instructor"], { alumnos: [1, 2] });
        assert.deepEqual(puede(instructor, "saltos:aprobar", { duenoId: 1 }), { permitido: true, motivo: "permitido por saltos:aprobar:mis_alumnos", regla: "saltos:aprobar:mis_alumnos" });

        const otro = puede(instructor, "saltos:aprobar", { duenoId: 3 });
        assert.equal(otro.permitido, false);
        assert.match(otro.motivo, /no esta en su alcance/);
    });

    it("comodin: jefe_dz puede cualquier accion de saltos", () => {
        const jefe = usuario(["jefe_dz"]);
        assert.equal(puede(jefe, "saltos:borrar", { duenoId: 1 }).regla, "saltos:*:todos");
    });

    it("la negacion gana aunque el rol lo permita", () => {
        const u = usuario(["jefe_dz"], { negaciones: [{ permiso: "saltos:crear", motivo: "restriccion medica" }] });
        assert.deepEqual(puede(u, "saltos:crear", { duenoId: 10 }), { permitido: false, motivo: "negado: restriccion medica", regla: "!saltos:crear" });
        assert.equal(puede(u, "saltos:aprobar", { duenoId: 1 }).permitido, true);
    });

    it("sin ningun rol que tenga el permiso, explica cuales tiene", () => {
        assert.match(puede(usuario(["rigger"]), "saltos:aprobar").motivo, /ninguno de sus roles \(rigger\) tiene saltos:aprobar/);
        assert.match(puede(usuario([]), "equipo:ver").motivo, /\(ninguno\)/);
    });
});
