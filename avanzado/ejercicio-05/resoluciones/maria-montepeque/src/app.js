import express from "express";
import { crearAlmacen } from "./datos/almacen.js";
import { DATOS_INICIALES } from "./datos/inicial.js";
import { crearFichajesServicio } from "./servicios/fichajes.servicio.js";
import { crearConsultas } from "./servicios/consultas.servicio.js";
import { AppError, FallaSimulada } from "./servicios/errores.js";

// cada app tiene su propio almacen (asi los tests no se pisan)
// conCandado se puede apagar para ver que pasa sin aislamiento
export function crearApp({ conCandado = true, permitirSimulacion = process.env.NODE_ENV !== "production" } = {}) {
    const almacen = crearAlmacen(DATOS_INICIALES, { conCandado });
    const fichajes = crearFichajesServicio(almacen);
    const consultas = crearConsultas(almacen, DATOS_INICIALES);

    const app = express();
    app.use(express.json());

    const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
    const id = (texto) => {
        const n = Number(texto);
        if (!Number.isInteger(n) || n < 1) throw new AppError(400, "DATOS_INVALIDOS", "El id debe ser un entero positivo");
        return n;
    };

    app.get("/health", (req, res) => {
        res.json({ ok: true, message: "Ejercicio ejecutado correctamente", topic: "transacciones simuladas" });
    });

    app.get("/api/clubes", (req, res) => res.json({ ok: true, data: consultas.clubes() }));
    app.get("/api/clubes/:id", (req, res) => res.json({ ok: true, data: consultas.club(id(req.params.id)) }));
    app.get("/api/fichajes", (req, res) => res.json({ ok: true, data: consultas.fichajes() }));
    app.get("/api/movimientos", (req, res) => res.json({ ok: true, data: consultas.movimientos() }));
    app.get("/api/consistencia", (req, res) => res.json({ ok: true, data: consultas.consistencia() }));

    app.post(
        "/api/fichajes",
        asyncHandler(async (req, res) => {
            // header para probar el rollback, solo fuera de produccion
            const simularFallo = permitirSimulacion ? req.get("X-Simular-Fallo") : undefined;
            const data = await fichajes.fichar(req.body, { simularFallo });
            res.status(201).json({ ok: true, data });
        })
    );

    app.use((req, res) => {
        res.status(404).json({ ok: false, code: "RUTA_NO_ENCONTRADA", message: `La ruta ${req.method} ${req.originalUrl} no existe` });
    });

    app.use((err, req, res, next) => {
        if (err.type === "entity.parse.failed") {
            return res.status(400).json({ ok: false, code: "DATOS_INVALIDOS", message: "El body no es un JSON valido" });
        }
        if (err instanceof AppError) {
            return res.status(err.status).json({ ok: false, code: err.code, message: err.message, ...(err.detalles && { detalles: err.detalles }) });
        }
        // la falla simulada es como un error inesperado a mitad del proceso
        if (err instanceof FallaSimulada) {
            return res.status(500).json({ ok: false, code: "FALLA_SIMULADA", message: `${err.message}. No se guardo ningun cambio.` });
        }
        console.error(err);
        res.status(500).json({ ok: false, code: "ERROR_INTERNO", message: "Error interno, no se guardo ningun cambio" });
    });

    return app;
}
