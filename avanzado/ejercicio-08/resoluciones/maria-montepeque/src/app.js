import express from "express";
import { Bus } from "./eventos/bus.js";
import { crearPedidosServicio, MODELOS } from "./servicios/pedidos.servicio.js";
import { registrarInventario } from "./suscriptores/inventario.js";
import { registrarNotificaciones } from "./suscriptores/notificaciones.js";
import { registrarAuditoria } from "./suscriptores/auditoria.js";

export function crearApp({ notificaciones: opcionesNotif = {} } = {}) {
    const bus = new Bus();

    // el orden importa: la auditoria primero para que vea todo
    const auditoria = registrarAuditoria(bus);
    const pedidos = crearPedidosServicio(bus);
    const inventario = registrarInventario(bus);
    const notificaciones = registrarNotificaciones(bus, opcionesNotif);

    const app = express();
    app.use(express.json());

    const id = (texto) => {
        const n = Number(texto);
        if (!Number.isInteger(n) || n < 1) throw Object.assign(new Error("El id debe ser un entero positivo"), { status: 400 });
        return n;
    };

    app.get("/health", (req, res) => {
        res.json({ ok: true, message: "Ejercicio ejecutado correctamente", topic: "event emitter" });
    });

    app.get("/api/modelos", (req, res) => res.json({ ok: true, data: MODELOS }));
    app.get("/api/pedidos", (req, res) => res.json({ ok: true, data: pedidos.listar() }));
    app.get("/api/pedidos/:id", (req, res) => res.json({ ok: true, data: pedidos.ver(id(req.params.id)) }));

    app.post("/api/pedidos", (req, res) => {
        const pedido = pedidos.crear(req.body);
        res.status(201).location(`/api/pedidos/${pedido.id}`).json({ ok: true, data: pedido });
    });
    app.post("/api/pedidos/:id/avanzar", (req, res) => res.json({ ok: true, data: pedidos.avanzar(id(req.params.id)) }));
    app.post("/api/pedidos/:id/cancelar", (req, res) => res.json({ ok: true, data: pedidos.cancelar(id(req.params.id)) }));

    app.get("/api/eventos", (req, res) => {
        const pedidoId = req.query.pedidoId ? id(req.query.pedidoId) : undefined;
        res.json({ ok: true, data: auditoria.registro({ pedidoId }) });
    });
    app.get("/api/inventario", (req, res) => res.json({ ok: true, data: inventario.stock() }));
    app.get("/api/notificaciones", (req, res) => res.json({ ok: true, data: notificaciones.enviados() }));
    app.get("/api/bus", (req, res) => res.json({ ok: true, data: { suscriptores: bus.resumen(), errores: bus.errores } }));

    app.use((req, res) => {
        res.status(404).json({ ok: false, message: `La ruta ${req.method} ${req.originalUrl} no existe` });
    });

    app.use((err, req, res, next) => {
        if (err.type === "entity.parse.failed") return res.status(400).json({ ok: false, message: "El body no es un JSON valido" });
        if (err.status) return res.status(err.status).json({ ok: false, message: err.message, ...(err.errores && { errors: err.errores }) });
        console.error(err);
        res.status(500).json({ ok: false, message: "Error interno del servidor" });
    });

    app.locals.bus = bus;
    return app;
}
