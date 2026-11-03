import express from "express";
import { crearDatos } from "./datos/club.js";
import { puede, rolesEfectivos, permisosEfectivos, nivelMaximo } from "./permisos/motor.js";
import { ROLES } from "./permisos/roles.js";

const error = (status, message, extra = {}) => Object.assign(new Error(message), { status, extra });

export function crearApp() {
    const db = crearDatos();
    const app = express();
    app.use(express.json());

    // autenticacion SIMULADA: el header dice quien es (el tema aqui es la autorizacion)
    // en una app real esto saldria del JWT (avanzado 17)
    app.use("/api", (req, res, next) => {
        const usuario = db.usuarios.find((u) => u.id === Number(req.get("X-Usuario-Id")));
        if (!usuario) return next(error(401, "Manda X-Usuario-Id con un usuario valido (1 a 6)"));
        req.usuario = usuario;
        next();
    });

    // revisa el permiso y si no, responde 403 con el motivo
    function exigir(req, accion, contexto) {
        const decision = puede(req.usuario, accion, contexto);
        if (!decision.permitido) throw error(403, `No puedes ${accion}`, { motivo: decision.motivo });
        return decision;
    }

    const buscarSalto = (id) => {
        const salto = db.saltos.find((s) => s.id === Number(id));
        if (!salto) throw error(404, `No existe el salto ${id}`);
        return salto;
    };

    app.get("/health", (req, res) => res.json({ ok: true, message: "Ejercicio ejecutado correctamente", topic: "multirol avanzado" }));

    // que puedo hacer yo
    app.get("/api/yo", (req, res) => {
        res.json({ ok: true, data: { id: req.usuario.id, nombre: req.usuario.nombre, rolesAsignados: req.usuario.roles, rolesEfectivos: rolesEfectivos(req.usuario), permisos: permisosEfectivos(req.usuario), negaciones: req.usuario.negaciones } });
    });

    // por que si o por que no (sirve para soporte y para la UI)
    app.get("/api/permisos/explicar", (req, res) => {
        const { accion, saltoId } = req.query;
        if (typeof accion !== "string" || !/^[a-z_]+:[a-z_]+$/.test(accion)) throw error(400, "accion debe ser recurso:accion, ej. saltos:aprobar");
        const contexto = saltoId ? { duenoId: buscarSalto(saltoId).alumnoId } : {};
        res.json({ ok: true, data: { usuario: req.usuario.nombre, accion, ...puede(req.usuario, accion, contexto) } });
    });

    // la lista se filtra: cada uno ve solo lo que su alcance le deja ver
    app.get("/api/saltos", (req, res) => {
        const visibles = db.saltos.filter((s) => puede(req.usuario, "saltos:ver", { duenoId: s.alumnoId }).permitido);
        res.json({ ok: true, total: visibles.length, data: visibles });
    });

    app.get("/api/saltos/:id", (req, res) => {
        const salto = buscarSalto(req.params.id);
        exigir(req, "saltos:ver", { duenoId: salto.alumnoId });
        res.json({ ok: true, data: salto });
    });

    // cada uno registra sus propios saltos
    app.post("/api/saltos", (req, res) => {
        exigir(req, "saltos:crear", { duenoId: req.usuario.id });
        const { altitud, fecha } = req.body || {};
        if (!Number.isInteger(altitud) || altitud < 1000 || altitud > 7000) throw error(400, "altitud debe ser un entero de 1000 a 7000 metros");
        if (typeof fecha !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) throw error(400, "fecha debe ser AAAA-MM-DD");

        const salto = { id: db.saltos.length + 1, alumnoId: req.usuario.id, altitud, fecha, estado: "pendiente" };
        db.saltos.push(salto);
        res.status(201).json({ ok: true, data: salto });
    });

    app.post("/api/saltos/:id/aprobar", (req, res) => {
        const salto = buscarSalto(req.params.id);
        const decision = exigir(req, "saltos:aprobar", { duenoId: salto.alumnoId });

        // regla extra: nadie aprueba su propio salto, aunque sea jefe
        if (salto.alumnoId === req.usuario.id) throw error(403, "No puedes aprobar tu propio salto", { motivo: "conflicto de interes" });
        if (salto.estado !== "pendiente") throw error(409, `El salto ya esta ${salto.estado}`);

        salto.estado = "aprobado";
        salto.aprobadoPor = req.usuario.id;
        res.json({ ok: true, data: salto, regla: decision.regla });
    });

    app.post("/api/equipo/:id/inspeccionar", (req, res) => {
        exigir(req, "equipo:inspeccionar");
        const item = db.equipo.find((e) => e.id === Number(req.params.id));
        if (!item) throw error(404, `No existe el equipo ${req.params.id}`);
        item.ultimaInspeccion = new Date().toISOString().slice(0, 10);
        item.inspeccionadoPor = req.usuario.id;
        res.json({ ok: true, data: item });
    });

    // dar un rol: solo con permiso, y nunca uno de nivel mas alto que el propio
    app.post("/api/usuarios/:id/roles", (req, res) => {
        exigir(req, "usuarios:asignar_rol");
        const destino = db.usuarios.find((u) => u.id === Number(req.params.id));
        if (!destino) throw error(404, `No existe el usuario ${req.params.id}`);

        const { rol, venceEn } = req.body || {};
        if (!Object.hasOwn(ROLES, rol)) throw error(400, `rol debe ser uno de: ${Object.keys(ROLES).join(", ")}`);
        if (venceEn !== undefined && Number.isNaN(Date.parse(venceEn))) throw error(400, "venceEn debe ser una fecha");
        if (ROLES[rol].nivel > nivelMaximo(req.usuario)) throw error(403, "No puedes dar un rol mas alto que el tuyo");

        destino.roles.push({ rol, ...(venceEn && { venceEn }) });
        res.status(201).json({ ok: true, data: { usuario: destino.nombre, rolesEfectivos: rolesEfectivos(destino) } });
    });

    app.use((req, res) => res.status(404).json({ ok: false, message: "Ruta no encontrada" }));
    app.use((err, req, res, next) => {
        if (err.type === "entity.parse.failed") return res.status(400).json({ ok: false, message: "El body no es un JSON valido" });
        if (err.status) return res.status(err.status).json({ ok: false, message: err.message, ...err.extra });
        console.error(err);
        res.status(500).json({ ok: false, message: "Error interno del servidor" });
    });

    return app;
}
