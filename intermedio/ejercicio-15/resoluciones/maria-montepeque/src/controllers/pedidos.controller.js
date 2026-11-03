import * as pedidosService from "../services/pedidos.service.js";

function listPlatos(req, res) {
    const data = pedidosService.findPlatos();
    res.json({ ok: true, total: data.length, data });
}

// req.usuario.sub es el id del usuario dentro del jwt
function misPedidos(req, res) {
    const data = pedidosService.findByUsuario(req.usuario.sub);
    res.json({ ok: true, total: data.length, data });
}

function createPedido(req, res) {
    const nuevo = pedidosService.create(req.body, req.usuario.sub);
    res.status(201).json({ ok: true, data: nuevo });
}

export { listPlatos, misPedidos, createPedido };
