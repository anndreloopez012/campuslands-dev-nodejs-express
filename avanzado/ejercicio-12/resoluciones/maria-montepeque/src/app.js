import express from "express";
import { createHash } from "node:crypto";
import { createGzip } from "node:zlib";
import { pipeline } from "node:stream/promises";
import { crearCatalogo } from "./datos/peliculas.js";
import { streamJson, proyectar, aJson } from "./exportar/serializar.js";
import { leerOpciones, filtrar, CAMPOS_PUBLICOS } from "./exportar/opciones.js";

const VERSION_FORMATO = "1.0";

export function crearApp({ copias = 200 } = {}) {
    const catalogo = crearCatalogo({ copias });
    const app = express();
    app.use(express.json());

    app.get("/health", (req, res) => {
        res.json({ ok: true, message: "Ejercicio ejecutado correctamente", topic: "exportacion JSON" });
    });

    app.get("/api/peliculas/exportar", async (req, res, next) => {
        try {
            const opciones = leerOpciones(req.query);

            // ETag: depende de la version de los datos y de lo que se pidio
            // si el cliente ya tiene esta misma exportacion, respondo 304 sin mandar nada
            const huella = createHash("sha1").update(aJson({ v: catalogo.version(), ...opciones })).digest("hex").slice(0, 16);
            const etag = `"exp-${huella}"`;
            res.set("ETag", etag);
            res.set("Vary", "Accept-Encoding");
            if (req.get("If-None-Match") === etag) return res.status(304).end();

            const peliculas = filtrar(catalogo.todas(), opciones);
            const fecha = new Date().toISOString().slice(0, 10);

            res.set("Content-Type", "application/json; charset=utf-8");
            res.set("Content-Disposition", `attachment; filename="peliculas-${fecha}.json"`);

            const cuerpo = streamJson({
                meta: { formato: VERSION_FORMATO, exportadoEn: new Date().toISOString(), versionDatos: catalogo.version(), campos: opciones.campos, filtros: { subgenero: opciones.subgenero ?? null, desde: opciones.desde ?? null } },
                nombreLista: "peliculas",
                items: peliculas,
                transformar: (p) => proyectar(p, opciones.campos)
            });

            // si el cliente acepta gzip, comprimo mientras se manda
            const pasos = [cuerpo];
            if (/\bgzip\b/.test(req.get("Accept-Encoding") || "")) {
                res.set("Content-Encoding", "gzip");
                pasos.push(createGzip());
            }
            await pipeline(...pasos, res);
        } catch (error) {
            if (error.code === "ERR_STREAM_PREMATURE_CLOSE") return;
            if (!res.headersSent) return next(error);
            res.destroy(error);
        }
    });

    // un cambio en los datos cambia la version (y el ETag)
    app.patch("/api/peliculas/:id/calificacion", (req, res) => {
        const { calificacion } = req.body || {};
        if (typeof calificacion !== "number" || calificacion < 0 || calificacion > 10) {
            return res.status(400).json({ ok: false, message: "calificacion debe ser un numero de 0 a 10" });
        }
        const pelicula = catalogo.calificar(Number(req.params.id), calificacion);
        if (!pelicula) return res.status(404).json({ ok: false, message: `No existe la pelicula ${req.params.id}` });
        // tambien uso el replacer aqui porque la pelicula tiene Set y BigInt
        res.type("application/json").send(aJson({ ok: true, data: proyectar(pelicula, CAMPOS_PUBLICOS) }));
    });

    app.get("/api/exportar/campos", (req, res) => res.json({ ok: true, data: CAMPOS_PUBLICOS }));

    app.use((req, res) => res.status(404).json({ ok: false, message: `La ruta ${req.method} ${req.originalUrl} no existe` }));

    app.use((err, req, res, next) => {
        if (err.type === "entity.parse.failed") return res.status(400).json({ ok: false, message: "El body no es un JSON valido" });
        if (err.status) return res.status(err.status).json({ ok: false, message: err.message });
        console.error(err);
        res.status(500).json({ ok: false, message: "Error interno del servidor" });
    });

    return app;
}
