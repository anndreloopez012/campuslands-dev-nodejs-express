import { platos, pedidos } from "../data/db.js";
import AppError from "../utils/app-error.js";

let nextId = pedidos.length + 1;

function findPlatos() {
    return platos;
}

// solo los pedidos del usuario que viene en el token
function findByUsuario(usuarioId) {
    return pedidos.filter((pedido) => pedido.usuarioId === usuarioId);
}

function create(body, usuarioId) {
    const { platoId, cantidad } = body || {};
    const errors = [];

    if (!Number.isInteger(platoId)) {
        errors.push("platoId debe ser un numero entero");
    }
    if (!Number.isInteger(cantidad) || cantidad < 1) {
        errors.push("cantidad debe ser un entero mayor a 0");
    }

    if (errors.length > 0) {
        throw new AppError(400, "Datos invalidos", errors);
    }

    const plato = platos.find((p) => p.id === platoId);
    if (!plato) {
        throw new AppError(404, `No existe el plato con id ${platoId}`);
    }

    // el total lo calculo yo, no lo mando el cliente
    const nuevo = { id: nextId++, usuarioId, platoId, cantidad, total: plato.precio * cantidad };
    pedidos.push(nuevo);
    return nuevo;
}

export { findPlatos, findByUsuario, create };
