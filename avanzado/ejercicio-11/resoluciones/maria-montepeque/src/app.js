import express from "express";
import { crearCatalogo, CANCIONES_INICIALES } from "./datos/catalogo.js";
import { importar, MODOS, GENEROS } from "./servicios/importador.js";

export function crearApp({ tamanoLote = 500, maxBytes = 20_000_000 } = {}) {
    const catalogo = crearCatalogo(CANCIONES_INICIALES);
    const importaciones = [];
    let importando = false;

    const app = express();
    app.use("/api/canciones", express.json());

    app.get("/health", (req, res) => {
        res.json({ ok: true, message: "Ejercicio ejecutado correctamente", topic: "importacion masiva" });
    });

    function leerOpciones(query) {
        const modo = query.modo ?? "insertar";
        if (!MODOS.includes(modo)) throw Object.assign(new Error(`modo debe ser uno de: ${MODOS.join(", ")}`), { status: 400 });
        const booleano = (v, nombre) => {
            if (v === undefined) return false;
            if (v === "true" || v === "false") return v === "true";
            throw Object.assign(new Error(`${nombre} debe ser true o false`), { status: 400 });
        };
        return { modo, todoONada: booleano(query.todoONada, "todoONada"), simular: booleano(query.simular, "simular") };
    }

    // el body se lee como stream (sin express.json), una cancion por linea
    app.post("/api/importaciones", async (req, res, next) => {
        try {
            if (!/application\/x-ndjson|text\/plain/.test(req.get("Content-Type") || "")) {
                throw Object.assign(new Error("Manda el archivo con Content-Type: application/x-ndjson"), { status: 415 });
            }
            // una importacion a la vez para que dos no se pisen con el mismo isrc
            if (importando) throw Object.assign(new Error("Ya hay una importacion en curso, intenta en un momento"), { status: 409 });

            const opciones = leerOpciones(req.query);
            importando = true;

            const registro = { id: importaciones.length + 1, estado: "en_proceso", opciones, inicio: new Date().toISOString(), progreso: null, reporte: null };
            importaciones.push(registro);

            try {
                const inicio = Date.now();
                registro.reporte = await importar(req, catalogo, {
                    ...opciones,
                    tamanoLote,
                    maxBytes,
                    alAvanzar: (p) => (registro.progreso = p)
                });
                registro.reporte.duracionMs = Date.now() - inicio;
                registro.estado = "terminada";
            } catch (error) {
                registro.estado = "fallida";
                registro.error = error.message;
                throw error;
            } finally {
                importando = false;
            }

            res.status(registro.reporte.aplicado ? 201 : 200).json({ ok: true, data: { id: registro.id, ...registro.reporte } });
        } catch (error) {
            next(error);
        }
    });

    app.get("/api/importaciones", (req, res) => res.json({ ok: true, data: importaciones.map(({ id, estado, opciones, inicio }) => ({ id, estado, opciones, inicio })) }));
    app.get("/api/importaciones/:id", (req, res) => {
        const registro = importaciones.find((i) => i.id === Number(req.params.id));
        if (!registro) return res.status(404).json({ ok: false, message: `No existe la importacion ${req.params.id}` });
        res.json({ ok: true, data: registro });
    });

    app.get("/api/canciones", (req, res) => {
        res.json({ ok: true, total: catalogo.total(), data: catalogo.listar({ artista: req.query.artista, q: req.query.q }) });
    });
    app.get("/api/canciones/:isrc", (req, res) => {
        const cancion = catalogo.buscar(req.params.isrc.toUpperCase());
        if (!cancion) return res.status(404).json({ ok: false, message: `No existe la cancion ${req.params.isrc}` });
        res.json({ ok: true, data: cancion });
    });
    app.get("/api/formato", (req, res) => {
        res.json({ ok: true, data: { generos: GENEROS, modos: MODOS, ejemplo: '{"isrc":"USUM71703861","titulo":"Despacito","artista":"Luis Fonsi","genero":"reggaeton","anio":2017,"duracionSeg":229}' } });
    });

    app.use((req, res) => res.status(404).json({ ok: false, message: `La ruta ${req.method} ${req.originalUrl} no existe` }));

    app.use((err, req, res, next) => {
        if (err.status) {
            if (err.status === 413) res.set("Connection", "close");
            return res.status(err.status).json({ ok: false, message: err.message });
        }
        console.error(err);
        res.status(500).json({ ok: false, message: "Error interno del servidor" });
    });

    app.locals.catalogo = catalogo;
    return app;
}
