import express from "express";
import { crearCola } from "./cola/cola.js";
import { crearTrabajoDiagnostico } from "./trabajos/diagnostico.js";
import { crearTrabajoNotificar } from "./trabajos/notificar.js";
import { crearRutas } from "./http/rutas.js";

// las opciones permiten que los tests usen tiempos cortos
export function crearApp({
    cola: opcionesCola = {},
    duracionDiagnosticoMs = 300,
    duracionNotificacionMs = 50,
    permitirSimulacion = process.env.NODE_ENV !== "production"
} = {}) {
    const cola = crearCola(opcionesCola);
    const notificar = crearTrabajoNotificar({ duracionMs: duracionNotificacionMs });

    cola.registrar("diagnostico", crearTrabajoDiagnostico({ duracionMs: duracionDiagnosticoMs }));
    cola.registrar("notificar-cliente", notificar);

    const { router, ErrorHttp } = crearRutas({ cola, permitirSimulacion });

    const app = express();
    app.use(express.json());

    app.get("/health", (req, res) => {
        res.json({ ok: true, message: "Ejercicio ejecutado correctamente", topic: "colas de tareas conceptuales" });
    });

    app.get("/api/sms-enviados", (req, res) => {
        res.json({ ok: true, data: notificar.enviados });
    });

    app.use("/api", router);

    app.use((req, res) => {
        res.status(404).json({ ok: false, message: `La ruta ${req.method} ${req.originalUrl} no existe` });
    });

    app.use((err, req, res, next) => {
        if (err.type === "entity.parse.failed") {
            return res.status(400).json({ ok: false, message: "El body no es un JSON valido" });
        }
        if (err instanceof ErrorHttp) {
            return res.status(err.status).json({ ok: false, message: err.message, ...(err.errores && { errors: err.errores }) });
        }
        console.error(err);
        res.status(500).json({ ok: false, message: "Error interno del servidor" });
    });

    // la cola queda accesible para el server (cierre) y los tests
    app.locals.cola = cola;
    app.locals.smsEnviados = notificar.enviados;
    return app;
}
