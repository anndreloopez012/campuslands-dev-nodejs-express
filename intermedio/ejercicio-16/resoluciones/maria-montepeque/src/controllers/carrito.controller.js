import * as carritoService from "../services/carrito.service.js";

// el usuario siempre sale del token, nunca de la url
// asi nadie puede ver el carrito de otro
function verCarrito(req, res) {
    const data = carritoService.armarCarrito(req.usuario.sub);
    res.json({ ok: true, data });
}

function agregarItem(req, res) {
    const data = carritoService.agregar(req.usuario.sub, req.body);
    res.status(201).json({ ok: true, data });
}

function quitarItem(req, res) {
    carritoService.quitar(req.usuario.sub, Number(req.params.sneakerId));
    res.status(204).send();
}

function verTodos(req, res) {
    const data = carritoService.todos();
    res.json({ ok: true, total: data.length, data });
}

export { verCarrito, agregarItem, quitarItem, verTodos };
