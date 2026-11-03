import express from "express";
import { cabecerasSeguras, cspConNonce, sinCache, cachePublica } from "./seguridad/cabeceras.js";
import { paginaMenu } from "./vistas/menu.js";

const PLATOS = [
    { id: 1, nombre: "Shuco de longaniza", precio: 15, puesto: "Shucos La Bendicion" },
    { id: 2, nombre: "Tacos al pastor", precio: 20, puesto: "El Trompo de Oro" },
    { id: 3, nombre: "Elote loco", precio: 12, puesto: "Elotes Don Beto" },
    // este nombre lo "metio" alguien malo: tiene que salir como texto, no ejecutarse
    { id: 4, nombre: '<script>alert("hackeado")</script>Pupusas', precio: 10, puesto: "Pupuseria <b>Ana</b>" }
];

export function crearApp({ produccion = process.env.NODE_ENV === "production", confiarProxy = false } = {}) {
    const app = express();
    const pedidos = [];

    // quito "X-Powered-By: Express": no hay que decirle al mundo que framework usamos
    app.disable("x-powered-by");

    // detras de un proxy (nginx, un balanceador) la conexion HTTPS la recibe el proxy
    // con trust proxy, req.secure mira el header X-Forwarded-Proto que pone el proxy
    if (confiarProxy) app.set("trust proxy", 1);

    app.use(cabecerasSeguras({ produccion }));
    app.use(express.json({ limit: "10kb" }));

    app.get("/health", (req, res) => {
        res.json({ ok: true, message: "Ejercicio ejecutado correctamente", topic: "seguridad de headers" });
    });

    // el menu es publico y cambia poco: se puede guardar 5 minutos
    app.get("/api/menu", cachePublica(300), (req, res) => {
        res.json({ ok: true, data: PLATOS });
    });

    // pagina HTML con su propia CSP (con nonce para su unico script)
    app.get("/menu", cspConNonce, cachePublica(60), (req, res) => {
        res.type("html").send(paginaMenu(PLATOS, res.locals.nonce));
    });

    // los pedidos tienen nombre y telefono: no se guardan en ninguna cache
    app.post("/api/pedidos", sinCache, (req, res) => {
        const { platoId, cliente, telefono } = req.body || {};
        const plato = PLATOS.find((p) => p.id === platoId);
        const errores = [];
        if (!plato) errores.push("platoId no existe");
        if (typeof cliente !== "string" || cliente.trim().length < 2) errores.push("cliente es obligatorio");
        if (typeof telefono !== "string" || !/^\d{8}$/.test(telefono)) errores.push("telefono debe tener 8 numeros");
        if (errores.length > 0) return res.status(400).json({ ok: false, message: "Datos invalidos", errors: errores });

        const pedido = { id: pedidos.length + 1, plato: plato.nombre, cliente: cliente.trim(), telefono };
        pedidos.push(pedido);
        res.status(201).json({ ok: true, data: pedido });
    });

    app.get("/api/pedidos/:id", sinCache, (req, res) => {
        const pedido = pedidos.find((p) => p.id === Number(req.params.id));
        if (!pedido) return res.status(404).json({ ok: false, message: "No existe el pedido" });
        res.json({ ok: true, data: pedido });
    });

    // los errores tambien llevan los headers (el middleware ya corrio) y no muestran el stack
    app.use((req, res) => res.status(404).json({ ok: false, message: "Ruta no encontrada" }));
    app.use((err, req, res, next) => {
        if (err.type === "entity.parse.failed") return res.status(400).json({ ok: false, message: "El body no es un JSON valido" });
        if (err.type === "entity.too.large") return res.status(413).json({ ok: false, message: "El body es demasiado grande" });
        console.error(err);
        res.status(500).json({ ok: false, message: "Error interno del servidor" });
    });

    return app;
}
