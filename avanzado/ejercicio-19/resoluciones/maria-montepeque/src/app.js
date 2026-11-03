import express from "express";
import { randomUUID } from "node:crypto";
import { crearRegistroAuditoria } from "./auditoria/registro.js";
import { crearCitas, ErrorCita } from "./servicios/citas.js";

const USUARIOS = [
    { id: 1, nombre: "Rosa (recepcion)", rol: "recepcion" },
    { id: 2, nombre: "Kevin (tatuador)", rol: "tatuador" },
    { id: 3, nombre: "Laura (auditora)", rol: "auditor" },
    { id: 4, nombre: "Mario (admin)", rol: "admin" }
];

export function crearApp({ reloj } = {}) {
    const auditoria = crearRegistroAuditoria({ reloj });
    const citas = crearCitas(auditoria);

    const app = express();
    app.use(express.json());

    // quien es (simulado con un header) y datos para la auditoria
    app.use("/api", (req, res, next) => {
        req.id = randomUUID();
        res.set("X-Request-Id", req.id);
        req.contexto = { ip: req.ip, requestId: req.id };

        req.actor = USUARIOS.find((u) => u.id === Number(req.get("X-Usuario-Id")));
        if (!req.actor) {
            // tambien queda registro de los intentos sin identificarse
            auditoria.anotar({ actor: null, accion: "acceso.sin_identificar", resultado: "denegado", motivo: `${req.method} ${req.originalUrl}`, contexto: req.contexto });
            return res.status(401).json({ ok: false, message: "Manda X-Usuario-Id (1 a 4)" });
        }
        next();
    });

    const id = (texto) => {
        const n = Number(texto);
        if (!Number.isInteger(n) || n < 1) throw new ErrorCita(400, "El id debe ser un entero positivo");
        return n;
    };

    app.get("/health", (req, res) => res.json({ ok: true, message: "Ejercicio ejecutado correctamente", topic: "auditoria de acciones" }));

    app.post("/api/citas", (req, res) => res.status(201).json({ ok: true, data: citas.crear(req.actor, req.body, req.contexto) }));
    app.get("/api/citas/:id", (req, res) => res.json({ ok: true, data: citas.ver(id(req.params.id)) }));
    app.patch("/api/citas/:id/fecha", (req, res) => res.json({ ok: true, data: citas.reprogramar(req.actor, id(req.params.id), req.body, req.contexto) }));
    app.post("/api/citas/:id/cancelar", (req, res) => res.json({ ok: true, data: citas.cancelar(req.actor, id(req.params.id), req.body, req.contexto) }));
    app.put("/api/citas/:id/salud", (req, res) => res.json({ ok: true, data: citas.registrarSalud(req.actor, id(req.params.id), req.body, req.contexto) }));

    // ---- auditoria ----

    // consultar la auditoria TAMBIEN queda auditado (quien miro que)
    app.get("/api/auditoria", (req, res) => {
        citas.exigir(req.actor, "auditoria.consultar", { tipo: "auditoria", id: null }, req.contexto);
        const filtros = {
            accion: req.query.accion,
            recursoTipo: req.query.recursoTipo,
            recursoId: req.query.recursoId !== undefined ? id(req.query.recursoId) : undefined,
            actorId: req.query.actorId !== undefined ? id(req.query.actorId) : undefined,
            resultado: req.query.resultado,
            desde: req.query.desde,
            hasta: req.query.hasta
        };
        const data = auditoria.buscar(filtros);
        auditoria.anotar({ actor: req.actor, accion: "auditoria.consultar", recurso: { tipo: "auditoria", id: null }, motivo: JSON.stringify(req.query), contexto: req.contexto });
        res.json({ ok: true, total: data.length, data });
    });

    app.get("/api/auditoria/verificar", (req, res) => {
        citas.exigir(req.actor, "auditoria.consultar", { tipo: "auditoria", id: null }, req.contexto);
        res.json({ ok: true, data: auditoria.verificar() });
    });

    // la auditoria no se edita ni se borra
    app.all("/api/auditoria*", (req, res) => {
        auditoria.anotar({ actor: req.actor, accion: "auditoria.intento_modificar", resultado: "denegado", motivo: `${req.method} ${req.originalUrl}`, contexto: req.contexto });
        res.set("Allow", "GET").status(405).json({ ok: false, message: "La auditoria no se puede modificar ni borrar" });
    });

    app.use((req, res) => res.status(404).json({ ok: false, message: "Ruta no encontrada" }));
    app.use((err, req, res, next) => {
        if (err.type === "entity.parse.failed") return res.status(400).json({ ok: false, message: "El body no es un JSON valido" });
        if (err instanceof ErrorCita) return res.status(err.status).json({ ok: false, message: err.message, ...(err.errores && { errors: err.errores }) });
        console.error(err);
        res.status(500).json({ ok: false, message: "Error interno del servidor" });
    });

    app.locals.auditoria = auditoria;
    return app;
}
