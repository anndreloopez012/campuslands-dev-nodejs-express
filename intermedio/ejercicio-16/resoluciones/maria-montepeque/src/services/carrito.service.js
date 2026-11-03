import { carritos } from "../data/db.js";
import AppError from "../utils/app-error.js";
import * as sneakersService from "./sneakers.service.js";

// armo el carrito con los datos de cada sneaker y el total
function armarCarrito(usuarioId) {
    const items = carritos.get(usuarioId) || [];

    const detalle = items.map((item) => {
        const sneaker = sneakersService.findById(item.sneakerId);
        return {
            sneakerId: sneaker.id,
            modelo: sneaker.modelo,
            precio: sneaker.precio,
            cantidad: item.cantidad,
            subtotal: sneaker.precio * item.cantidad
        };
    });

    const total = detalle.reduce((suma, item) => suma + item.subtotal, 0);
    return { usuarioId, items: detalle, total };
}

function agregar(usuarioId, body) {
    const { sneakerId, cantidad } = body || {};

    if (!Number.isInteger(sneakerId) || !Number.isInteger(cantidad) || cantidad < 1) {
        throw new AppError(400, "sneakerId y cantidad deben ser enteros, cantidad mayor a 0");
    }

    const sneaker = sneakersService.findById(sneakerId);
    const items = carritos.get(usuarioId) || [];
    const existente = items.find((item) => item.sneakerId === sneakerId);
    const yaTengo = existente ? existente.cantidad : 0;

    // no dejo pedir mas de lo que hay
    if (yaTengo + cantidad > sneaker.stock) {
        throw new AppError(409, `Solo hay ${sneaker.stock} en stock de ${sneaker.modelo}`);
    }

    if (existente) {
        existente.cantidad += cantidad;
    } else {
        items.push({ sneakerId, cantidad });
    }

    carritos.set(usuarioId, items);
    return armarCarrito(usuarioId);
}

function quitar(usuarioId, sneakerId) {
    const items = carritos.get(usuarioId) || [];
    const index = items.findIndex((item) => item.sneakerId === sneakerId);

    if (index === -1) {
        throw new AppError(404, `El sneaker ${sneakerId} no esta en tu carrito`);
    }

    items.splice(index, 1);
}

// solo para el admin
function todos() {
    return [...carritos.keys()].map(armarCarrito);
}

export { armarCarrito, agregar, quitar, todos };
