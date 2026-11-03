import express from "express";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { limpiarTexto, quitarHtml, numeroEstricto } from "./sanitizar/texto.js";
import { buscarLlavesPeligrosas, mergeSeguro, elegir } from "./sanitizar/objetos.js";
import { textoDeQuery, escaparRegex, rutaDentroDe } from "./sanitizar/entrada.js";

const CARPETA_IMAGENES = fileURLToPath(new URL("../data/imagenes/", import.meta.url));

const PRODUCTOS = [
    { id: 1, nombre: "Air Max 90", marca: "Nike", precio: 1200, imagen: "air-max-90.txt" },
    { id: 2, nombre: "Forum Low", marca: "Adidas", precio: 950, imagen: "forum-low.txt" },
    { id: 3, nombre: "Old Skool", marca: "Vans", precio: 600, imagen: null },
    { id: 4, nombre: "Air Force 1", marca: "Nike", precio: 900, imagen: null },
    { id: 5, nombre: "Chuck 70 (Hi)", marca: "Converse", precio: 700, imagen: null }
];

const error = (status, message, errores) => Object.assign(new Error(message), { status, errores });

export function crearApp() {
    const resenas = [];
    // perfil del usuario (en una app real seria por usuario)
    const perfil = { nombre: "Diana", rol: "cliente", saldo: 0, preferencias: { tallas: [38], colores: ["negro"] } };

    const app = express();
    app.use(express.json({ limit: "20kb" }));

    // ANTES de cualquier ruta: rechazo bodies con __proto__, constructor o prototype
    app.use((req, res, next) => {
        const peligrosas = buscarLlavesPeligrosas(req.body);
        if (peligrosas.length > 0) return next(error(400, "El body tiene llaves no permitidas", peligrosas));
        next();
    });

    app.get("/health", (req, res) => res.json({ ok: true, message: "Ejercicio ejecutado correctamente", topic: "sanitizacion de entrada" }));

    // busqueda: q se usa dentro de una RegExp, por eso se escapa
    app.get("/api/productos", (req, res, next) => {
        const q = textoDeQuery(req.query.q);
        const marca = textoDeQuery(req.query.marca);
        if (q === null || marca === null) return next(error(400, "q y marca deben venir una sola vez y como texto"));

        let lista = PRODUCTOS;
        if (marca) lista = lista.filter((p) => p.marca.toLowerCase() === marca.toLowerCase());
        if (q) {
            const limpia = limpiarTexto(q, { max: 50 });
            const patron = new RegExp(escaparRegex(limpia), "i");
            lista = lista.filter((p) => patron.test(p.nombre));
        }
        res.json({ ok: true, data: lista });
    });

    // reseña: texto limpio y sin HTML, numeros estrictos, solo los campos permitidos
    app.post("/api/productos/:id/resenas", (req, res, next) => {
        const productoId = numeroEstricto(req.params.id, { entero: true, min: 1 });
        if (!PRODUCTOS.some((p) => p.id === productoId)) return next(error(404, "No existe el producto"));

        const datos = elegir(req.body, ["autor", "texto", "calificacion"]);
        const autor = limpiarTexto(datos.autor, { max: 40 });
        const texto = datos.texto === undefined ? null : quitarHtml(limpiarTexto(datos.texto, { max: 1000, multilinea: true }) ?? "");
        const calificacion = numeroEstricto(datos.calificacion, { entero: true, min: 1, max: 5 });

        const errores = [];
        if (!autor || autor.length < 2) errores.push("autor debe ser texto de 2 a 40 caracteres");
        if (!texto || texto.length < 5) errores.push("texto debe tener al menos 5 caracteres (sin contar HTML)");
        if (calificacion === null) errores.push("calificacion debe ser un entero de 1 a 5");
        if (errores.length > 0) return next(error(400, "Datos invalidos", errores));

        const resena = { id: resenas.length + 1, productoId, autor, texto, calificacion };
        resenas.push(resena);
        res.status(201).json({ ok: true, data: resena });
    });

    app.get("/api/productos/:id/resenas", (req, res) => {
        res.json({ ok: true, data: resenas.filter((r) => r.productoId === Number(req.params.id)) });
    });

    // perfil: merge profundo de preferencias, pero SIN dejar tocar rol ni saldo
    app.patch("/api/perfil", (req, res, next) => {
        const cambios = elegir(req.body, ["nombre", "preferencias"]);
        if (cambios.nombre !== undefined) {
            cambios.nombre = limpiarTexto(cambios.nombre, { max: 40 });
            if (!cambios.nombre) return next(error(400, "nombre debe ser texto"));
        }
        if (cambios.preferencias !== undefined && (typeof cambios.preferencias !== "object" || cambios.preferencias === null || Array.isArray(cambios.preferencias))) {
            return next(error(400, "preferencias debe ser un objeto"));
        }
        mergeSeguro(perfil, cambios);
        res.json({ ok: true, data: perfil });
    });

    // imagenes: el nombre del archivo viene de la URL, puede traer ../
    app.get("/api/imagenes/:archivo", async (req, res, next) => {
        const ruta = rutaDentroDe(CARPETA_IMAGENES, req.params.archivo);
        if (!ruta) return next(error(400, "Nombre de archivo no valido"));
        try {
            res.type("text/plain").send(await readFile(ruta, "utf8"));
        } catch {
            next(error(404, "No existe esa imagen"));
        }
    });

    app.use((req, res) => res.status(404).json({ ok: false, message: "Ruta no encontrada" }));
    app.use((err, req, res, next) => {
        if (err.type === "entity.parse.failed") return res.status(400).json({ ok: false, message: "El body no es un JSON valido" });
        if (err.type === "entity.too.large") return res.status(413).json({ ok: false, message: "El body es demasiado grande" });
        if (err.status) return res.status(err.status).json({ ok: false, message: err.message, ...(err.errores && { errors: err.errores }) });
        console.error(err);
        res.status(500).json({ ok: false, message: "Error interno del servidor" });
    });

    return app;
}
