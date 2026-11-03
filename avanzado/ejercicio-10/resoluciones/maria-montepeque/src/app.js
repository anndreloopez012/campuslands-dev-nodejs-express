import express from "express";
import { createReadStream } from "node:fs";
import { fileURLToPath } from "node:url";
import { leerPartidos, calcularRanking, COLUMNAS } from "./servicios/partidos.js";

const ARCHIVO_POR_DEFECTO = fileURLToPath(new URL("../data/partidos.csv", import.meta.url));

export function crearApp({ archivo = ARCHIVO_POR_DEFECTO } = {}) {
    const app = express();
    const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

    // lee el archivo cada vez con un stream (si cambia el CSV se ve al instante)
    const desdeArchivo = () => leerPartidos(createReadStream(archivo));

    app.get("/health", (req, res) => {
        res.json({ ok: true, message: "Ejercicio ejecutado correctamente", topic: "lectura de CSV" });
    });

    app.get("/api/ranking", asyncHandler(async (req, res) => {
        const { partidos, invalidos } = await desdeArchivo();
        res.json({ ok: true, partidosLeidos: partidos.length, filasConError: invalidos, data: calcularRanking(partidos) });
    }));

    app.get("/api/partidos", asyncHandler(async (req, res) => {
        const { partidos } = await desdeArchivo();
        const jugador = typeof req.query.jugador === "string" ? req.query.jugador.toLowerCase() : null;
        const data = jugador ? partidos.filter((p) => [p.jugadorA, p.jugadorB].some((j) => j.toLowerCase() === jugador)) : partidos;
        res.json({ ok: true, total: data.length, data });
    }));

    // revisar un CSV subido sin guardarlo: dice que filas estan bien y cuales no
    app.post("/api/partidos/revisar", asyncHandler(async (req, res) => {
        const tipo = req.get("Content-Type") || "";
        if (!/text\/csv|text\/plain/.test(tipo)) {
            throw Object.assign(new Error("Manda el archivo con Content-Type: text/csv"), { status: 415 });
        }

        const resultado = await leerPartidos(req);
        res.json({
            ok: true,
            data: {
                filas: resultado.filas,
                validos: resultado.validos,
                invalidos: resultado.invalidos,
                errores: resultado.errores,
                erroresTruncados: resultado.erroresTruncados,
                vistaPrevia: resultado.partidos.slice(0, 5)
            }
        });
    }));

    app.get("/api/formato", (req, res) => {
        res.json({ ok: true, data: { columnas: COLUMNAS, ejemplo: "fecha,torneo,jugador_a,jugador_b,sets_a,sets_b\n2026-03-01,Copa,Ma Long,Fan Zhendong,3,1" } });
    });

    app.use((req, res) => {
        res.status(404).json({ ok: false, message: `La ruta ${req.method} ${req.originalUrl} no existe` });
    });

    app.use((err, req, res, next) => {
        if (err.status) return res.status(err.status).json({ ok: false, message: err.message, ...(err.encabezado && { encabezadoLeido: err.encabezado }) });
        if (err.code === "ENOENT") return res.status(500).json({ ok: false, message: "No se encontro el archivo de partidos" });
        console.error(err);
        res.status(500).json({ ok: false, message: "Error interno del servidor" });
    });

    return app;
}
