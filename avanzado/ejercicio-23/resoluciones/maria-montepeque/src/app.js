import express from "express";
import { ErrorCron, parsearCron, siguientes } from "./jobs/cron.js";
import { crearPlanificador } from "./jobs/planificador.js";
import { crearTaller } from "./servicios/taller.js";

export function crearApp({ reloj = () => new Date() } = {}) {
    const taller = crearTaller();
    const planificador = crearPlanificador({ reloj });

    // los jobs del taller (horas en UTC)
    planificador.registrar({ nombre: "certificaciones", cron: "0 7 * * *", descripcion: "Avisa certificaciones de soldadores por vencer", tarea: taller.revisarCertificaciones });
    planificador.registrar({ nombre: "mantenimiento", cron: "0 * * * 1-6", descripcion: "Cada hora de lunes a sabado revisa horas de uso de las maquinas", tarea: taller.revisarMantenimiento });
    planificador.registrar({ nombre: "reporte-consumo", cron: "30 6 * * *", descripcion: "Resumen de electrodo y gas del dia anterior", tarea: taller.reporteConsumo, reintentos: 2 });
    planificador.registrar({ nombre: "limpiar-inspecciones", cron: "0 3 * * 0", descripcion: "Domingos 03:00 borra inspecciones de mas de 90 dias", tarea: taller.limpiarInspecciones });

    const app = express();
    app.use(express.json());

    app.get("/health", (req, res) => res.json({ ok: true, message: "Ejercicio ejecutado correctamente", topic: "jobs programados" }));

    app.get("/api/jobs", (req, res) => res.json({ ok: true, ahora: reloj().toISOString(), data: planificador.listar() }));
    app.get("/api/jobs/:nombre/historial", (req, res) => res.json({ ok: true, data: planificador.historial(req.params.nombre) }));

    // correr un job a mano (por ejemplo para probarlo)
    app.post("/api/jobs/:nombre/ejecutar", async (req, res, next) => {
        try {
            const registro = await planificador.ejecutarAhora(req.params.nombre);
            const status = registro.estado === "saltado" ? 409 : registro.estado === "error" ? 500 : 200;
            res.status(status).json({ ok: registro.estado === "ok", data: registro });
        } catch (err) {
            next(err);
        }
    });

    app.post("/api/jobs/:nombre/pausar", (req, res) => res.json({ ok: true, data: planificador.pausar(req.params.nombre) }));
    app.post("/api/jobs/:nombre/reanudar", (req, res) => res.json({ ok: true, data: planificador.reanudar(req.params.nombre) }));

    // para ver cuando correria una expresion cron
    app.get("/api/cron/siguientes", (req, res) => {
        const n = Math.min(Number(req.query.n) || 5, 20);
        const cron = parsearCron(req.query.expr ?? "");
        res.json({ ok: true, expresion: cron.expresion, data: siguientes(cron, reloj(), n).map((f) => f.toISOString()) });
    });

    app.get("/api/taller/alertas", (req, res) => res.json({ ok: true, data: taller.alertas() }));

    app.use((req, res) => res.status(404).json({ ok: false, message: "Ruta no encontrada" }));
    app.use((err, req, res, next) => {
        if (err.type === "entity.parse.failed") return res.status(400).json({ ok: false, message: "El body no es un JSON valido" });
        if (err instanceof ErrorCron) return res.status(400).json({ ok: false, message: `Expresion cron invalida: ${err.message}` });
        if (err.status) return res.status(err.status).json({ ok: false, message: err.message });
        console.error(err);
        res.status(500).json({ ok: false, message: "Error interno del servidor" });
    });

    app.locals.planificador = planificador;
    app.locals.taller = taller;
    return app;
}
