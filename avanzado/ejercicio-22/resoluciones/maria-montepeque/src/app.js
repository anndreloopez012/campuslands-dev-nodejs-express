import express from "express";
import { crearEmisor } from "./webhooks/emisor.js";
import { verificarFirma } from "./webhooks/firma.js";
import { crearProyectos } from "./servicios/proyectos.js";

export function crearApp({ secretoGranja = process.env.SECRETO_GRANJA || "secreto-de-desarrollo", emisor = crearEmisor(), reloj = Date.now } = {}) {
    const proyectos = crearProyectos();
    const procesados = new Set(); // ids de eventos que ya recibimos
    const recibidosSimulador = []; // lo que le llega al "cliente" falso

    const app = express();

    app.get("/health", (req, res) => res.json({ ok: true, message: "Ejercicio ejecutado correctamente", topic: "webhooks simulados" }));

    // ---- RECIBIR webhooks de la granja de render ----
    // ojo: aqui necesito el body CRUDO (texto) porque la firma se hizo sobre esos bytes exactos
    app.post("/webhooks/granja", express.text({ type: "application/json", limit: "100kb" }), (req, res) => {
        const cuerpo = typeof req.body === "string" ? req.body : "";
        const firma = verificarFirma(secretoGranja, cuerpo, req.get("X-Firma"), { ahora: reloj() });
        if (!firma.valida) return res.status(401).json({ ok: false, message: `Webhook rechazado: ${firma.motivo}` });

        let evento;
        try {
            evento = JSON.parse(cuerpo);
        } catch {
            return res.status(400).json({ ok: false, message: "El body no es un JSON valido" });
        }
        if (typeof evento.id !== "string" || typeof evento.tipo !== "string") return res.status(400).json({ ok: false, message: "El evento necesita id y tipo" });

        // la granja puede mandar el mismo evento 2 veces: respondo 200 pero no lo aplico otra vez
        if (procesados.has(evento.id)) return res.json({ ok: true, duplicado: true });
        procesados.add(evento.id);

        const resultado = proyectos.aplicarEvento(evento.tipo, evento.datos);
        if (resultado.aplicado) {
            // aviso a mis suscriptores, pero NO espero: a la granja se le responde rapido
            emisor.emitir(`proyecto.${resultado.proyecto.estado}`, resultado.proyecto).catch((err) => console.error("error emitiendo", err.message));
        }
        res.json({ ok: true, aplicado: resultado.aplicado, ...(resultado.motivo && { motivo: resultado.motivo }) });
    });

    app.use(express.json());

    app.get("/api/proyectos", (req, res) => res.json({ ok: true, data: proyectos.listar() }));
    app.get("/api/proyectos/:id", (req, res) => {
        const p = proyectos.ver(req.params.id);
        if (!p) return res.status(404).json({ ok: false, message: "Proyecto no encontrado" });
        res.json({ ok: true, data: p });
    });

    // ---- ENVIAR webhooks a quien se suscriba ----
    app.post("/api/suscripciones", (req, res) => {
        const { url, eventos, secreto } = req.body ?? {};
        const errores = [];
        try {
            const u = new URL(url);
            if (!["http:", "https:"].includes(u.protocol)) errores.push("url debe ser http o https");
        } catch {
            errores.push("url invalida");
        }
        if (!Array.isArray(eventos) || eventos.length === 0 || !eventos.every((e) => typeof e === "string")) errores.push("eventos debe ser una lista de textos, ej. [\"proyecto.*\"]");
        if (typeof secreto !== "string" || secreto.length < 16) errores.push("secreto debe tener al menos 16 caracteres");
        if (errores.length > 0) return res.status(400).json({ ok: false, message: "Datos invalidos", errors: errores });

        const s = emisor.suscribir({ url, eventos, secreto });
        res.status(201).json({ ok: true, data: { id: s.id, url, eventos } });
    });

    app.get("/api/suscripciones", (req, res) => res.json({ ok: true, data: emisor.suscripciones() }));
    app.get("/api/entregas", (req, res) => res.json({ ok: true, data: emisor.entregas(), muertos: emisor.muertos().length }));

    // ---- cliente falso para probar sin otro servidor ----
    // ?fallar=N hace que responda 500 las primeras N veces
    let fallosPendientes = 0;
    app.post("/simulador/recibir", (req, res) => {
        if (req.query.configurarFallos !== undefined) {
            fallosPendientes = Number(req.query.configurarFallos);
            return res.json({ ok: true, fallosPendientes });
        }
        if (fallosPendientes > 0) {
            fallosPendientes--;
            return res.status(500).json({ ok: false, message: "fallo simulado" });
        }
        recibidosSimulador.push({ tipo: req.get("X-Evento-Tipo"), intento: req.get("X-Intento"), firma: req.get("X-Firma"), body: req.body });
        res.json({ ok: true });
    });
    app.get("/simulador/recibidos", (req, res) => res.json({ ok: true, data: recibidosSimulador }));

    app.use((req, res) => res.status(404).json({ ok: false, message: "Ruta no encontrada" }));
    app.use((err, req, res, next) => {
        if (err.type === "entity.parse.failed") return res.status(400).json({ ok: false, message: "El body no es un JSON valido" });
        if (err.type === "entity.too.large") return res.status(413).json({ ok: false, message: "El webhook es muy grande" });
        console.error(err);
        res.status(500).json({ ok: false, message: "Error interno del servidor" });
    });

    app.locals.emisor = emisor;
    return app;
}
