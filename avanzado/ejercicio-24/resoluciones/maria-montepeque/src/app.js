import express from "express";
import { openapi } from "./docs/openapi.js";
import { paginaDocs } from "./docs/html.js";
import { validarBody } from "./docs/validador.js";
import { ErrorFormula, masaMolar } from "./quimica/formula.js";
import { crearCompuestos, TIPOS } from "./servicios/compuestos.js";

export function crearApp() {
    const compuestos = crearCompuestos();
    const app = express();
    app.use(express.json());

    // ---- documentacion ----
    app.get("/openapi.json", (req, res) => res.json(openapi));
    app.get("/docs", (req, res) => res.type("html").send(paginaDocs(openapi)));

    app.get("/health", (req, res) => res.json({ ok: true, message: "Ejercicio ejecutado correctamente", topic: "documentacion OpenAPI manual" }));

    app.get("/api/compuestos", (req, res) => {
        const { tipo } = req.query;
        if (tipo !== undefined && !TIPOS.includes(tipo)) return res.status(400).json({ ok: false, message: `tipo debe ser uno de: ${TIPOS.join(", ")}` });
        res.json({ ok: true, data: compuestos.listar(tipo) });
    });

    app.get("/api/compuestos/:formula", (req, res) => {
        const c = compuestos.ver(req.params.formula);
        if (!c) return res.status(404).json({ ok: false, message: "Compuesto no encontrado" });
        res.json({ ok: true, data: c });
    });

    // el body se valida con el MISMO schema que esta en la documentacion
    app.post("/api/compuestos", validarBody(openapi, "/api/compuestos", "post"), (req, res) => {
        if (compuestos.existe(req.body.formula)) return res.status(409).json({ ok: false, message: "Ya existe ese compuesto" });
        res.status(201).json({ ok: true, data: compuestos.guardar(req.body) });
    });

    app.post("/api/masa-molar", validarBody(openapi, "/api/masa-molar", "post"), (req, res) => {
        res.json({ ok: true, data: masaMolar(req.body.formula) });
    });

    app.use((req, res) => res.status(404).json({ ok: false, message: "Ruta no encontrada" }));
    app.use((err, req, res, next) => {
        if (err.type === "entity.parse.failed") return res.status(400).json({ ok: false, message: "El body no es un JSON valido" });
        if (err instanceof ErrorFormula) return res.status(400).json({ ok: false, message: `Formula invalida: ${err.message}` });
        console.error(err);
        res.status(500).json({ ok: false, message: "Error interno del servidor" });
    });

    return app;
}
