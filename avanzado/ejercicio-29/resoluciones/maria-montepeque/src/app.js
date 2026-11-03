import express from "express";
import { readFileSync } from "node:fs";
import { crearSalud } from "./http/salud.js";
import { limitePorIp, logAcceso, requestId, seguridad } from "./http/middlewares.js";
import { crearLiga, ErrorLiga } from "./servicios/liga.js";

const paquete = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

// "base de datos" simulada: en la vida real seria un ping a postgres/mongo
export function crearBaseSimulada() {
    let caida = false;
    let lenta = 0;
    return {
        ping: async () => {
            if (lenta) await new Promise((r) => setTimeout(r, lenta));
            if (caida) throw new Error("conexion rechazada");
        },
        simularCaida: (v = true) => (caida = v),
        simularLentitud: (ms) => (lenta = ms)
    };
}

export function crearApp(config, { base = crearBaseSimulada(), escribirLog = (linea) => process.stdout.write(`${JSON.stringify(linea)}\n`), reloj } = {}) {
    const liga = crearLiga();
    const salud = crearSalud({
        dependencias: [{ nombre: "base-de-datos", revisar: base.ping }],
        timeoutMs: 500,
        version: { nombre: paquete.name, version: paquete.version, commit: config.gitSha, entorno: config.entorno, node: process.version }
    });

    const app = express();
    app.disable("x-powered-by");
    if (config.confiarProxy) app.set("trust proxy", 1);

    app.use(requestId);
    app.use(logAcceso(escribirLog));
    app.use(seguridad);

    // salud y version van ANTES del limite: el orquestador las llama seguido
    app.get("/health", (req, res) => res.json({ ok: true, message: "Ejercicio ejecutado correctamente", topic: "deploy readiness" }));
    app.get("/health/live", salud.live);
    app.get("/health/ready", salud.ready);
    app.get("/version", salud.version);

    app.use(limitePorIp({ porMinuto: config.limitePorMinuto, reloj }));
    app.use(express.json({ limit: "10kb" }));

    app.get("/api/:modalidad/tabla", (req, res) => res.json({ ok: true, data: liga.tabla(req.params.modalidad) }));
    app.post("/api/partidos", (req, res) => res.status(201).json({ ok: true, data: liga.registrar(req.body) }));

    app.use((req, res) => res.status(404).json({ ok: false, message: "Ruta no encontrada" }));
    app.use((err, req, res, next) => {
        if (err.type === "entity.parse.failed") return res.status(400).json({ ok: false, message: "El body no es un JSON valido" });
        if (err.type === "entity.too.large") return res.status(413).json({ ok: false, message: "El body es muy grande" });
        if (err instanceof ErrorLiga) return res.status(err.status).json({ ok: false, message: err.message, ...(err.errores && { errors: err.errores }) });
        escribirLog({ nivel: "error", fecha: new Date().toISOString(), requestId: req.id, mensaje: err.message, stack: config.produccion ? undefined : err.stack });
        // en produccion nunca se manda el detalle del error al cliente
        res.status(500).json({ ok: false, message: "Error interno del servidor", requestId: req.id });
    });

    app.locals.salud = salud;
    app.locals.base = base;
    return app;
}
