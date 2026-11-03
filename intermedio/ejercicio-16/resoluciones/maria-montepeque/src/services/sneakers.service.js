import { sneakers } from "../data/db.js";
import AppError from "../utils/app-error.js";

let nextId = sneakers.length + 1;

function findAll() {
    return sneakers;
}

function findById(id) {
    if (!Number.isInteger(id)) {
        throw new AppError(400, "El id del sneaker debe ser un numero");
    }

    const sneaker = sneakers.find((s) => s.id === id);

    if (!sneaker) {
        throw new AppError(404, `No existe el sneaker con id ${id}`);
    }

    return sneaker;
}

function create(body) {
    const { modelo, marca, talla, precio, stock } = body || {};
    const errors = [];

    if (typeof modelo !== "string" || modelo.trim() === "") errors.push("modelo es obligatorio");
    if (typeof marca !== "string" || marca.trim() === "") errors.push("marca es obligatoria");
    if (typeof talla !== "number" || talla <= 0) errors.push("talla debe ser un numero mayor a 0");
    if (typeof precio !== "number" || precio <= 0) errors.push("precio debe ser un numero mayor a 0");
    if (!Number.isInteger(stock) || stock < 0) errors.push("stock debe ser un entero de 0 para arriba");

    if (errors.length > 0) {
        throw new AppError(400, "Datos invalidos", errors);
    }

    const nuevo = { id: nextId++, modelo: modelo.trim(), marca: marca.trim(), talla, precio, stock };
    sneakers.push(nuevo);
    return nuevo;
}

function updateStock(id, body) {
    const sneaker = findById(id);
    const { stock } = body || {};

    if (!Number.isInteger(stock) || stock < 0) {
        throw new AppError(400, "stock debe ser un entero de 0 para arriba");
    }

    sneaker.stock = stock;
    return sneaker;
}

export { findAll, findById, create, updateStock };
