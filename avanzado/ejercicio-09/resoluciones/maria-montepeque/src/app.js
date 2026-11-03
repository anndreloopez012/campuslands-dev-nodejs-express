import express from "express";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { generarPeleas, TOTAL_PELEAS } from "./datos/peleas.js";
import { filtrar, aNdjson, aCsv, limitarBytes, separarLineas, estadisticasGolpes, TIPOS } from "./streams/transformaciones.js";

const CATEGORIAS = ["pluma", "ligero", "welter", "medio", "pesado"];
const COLUMNAS = ["id", "fecha", "rojo", "azul", "categoria", "resultado", "round"];

export function crearApp({ totalPeleas = TOTAL_PELEAS, maxBytesSubida = 1_000_000 } = {}) {
    const app = express();
    // ojo: NO uso express.json() en /api/golpes, el body se lee como stream
    // ultimo estado de generacion, para ver en los tests si se freno al cortar
    app.locals.ultimaExportacion = {};

    app.get("/health", (req, res) => {
        res.json({ ok: true, message: "Ejercicio ejecutado correctamente", topic: "streams basicos" });
    });

    function filtroDeQuery(query) {
        const { categoria } = query;
        if (categoria !== undefined && !CATEGORIAS.includes(categoria)) {
            throw Object.assign(new Error(`categoria debe ser una de: ${CATEGORIAS.join(", ")}`), { status: 400 });
        }
        return (p) => !categoria || p.categoria === categoria;
    }

    // exportar: generador -> filtro -> formato -> respuesta
    // pipeline conecta todo, maneja la contrapresion y si algo falla destruye a todos
    async function exportar(req, res, next, { tipo, formato }) {
        try {
            const condicion = filtroDeQuery(req.query);
            const estado = {};
            app.locals.ultimaExportacion = estado;

            res.set("Content-Type", tipo);
            await pipeline(Readable.from(generarPeleas({ total: totalPeleas, estado })), filtrar(condicion), formato, res);
        } catch (error) {
            // si el cliente corta la descarga, pipeline tira ERR_STREAM_PREMATURE_CLOSE: no es un error nuestro
            if (error.code === "ERR_STREAM_PREMATURE_CLOSE") return;
            if (!res.headersSent) return next(error);
            res.destroy(error);
        }
    }

    app.get("/api/peleas.ndjson", (req, res, next) => exportar(req, res, next, { tipo: "application/x-ndjson", formato: aNdjson() }));
    app.get("/api/peleas.csv", (req, res, next) => {
        res.set("Content-Disposition", 'attachment; filename="peleas.csv"');
        exportar(req, res, next, { tipo: "text/csv; charset=utf-8", formato: aCsv(COLUMNAS) });
    });

    // subir: body -> limite de bytes -> lineas -> estadisticas
    // se pueden mandar millones de golpes sin tenerlos todos en memoria
    app.post("/api/golpes", async (req, res, next) => {
        const estadisticas = estadisticasGolpes();
        try {
            await pipeline(req, limitarBytes(maxBytesSubida), separarLineas(), estadisticas);
            res.json({ ok: true, data: estadisticas.resultado() });
        } catch (error) {
            next(error);
        }
    });

    app.get("/api/golpes/tipos", (req, res) => res.json({ ok: true, data: TIPOS }));

    app.use((req, res) => {
        res.status(404).json({ ok: false, message: `La ruta ${req.method} ${req.originalUrl} no existe` });
    });

    app.use((err, req, res, next) => {
        if (err.status) {
            // si el body era muy grande dejo de leer y cierro la conexion despues de responder
            if (err.status === 413) res.set("Connection", "close");
            return res.status(err.status).json({ ok: false, message: err.message });
        }
        console.error(err);
        res.status(500).json({ ok: false, message: "Error interno del servidor" });
    });

    return app;
}
