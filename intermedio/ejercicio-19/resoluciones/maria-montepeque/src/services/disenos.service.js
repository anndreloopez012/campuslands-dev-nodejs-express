import config from "../config/env.js";
import { disenos } from "../data/db.js";
import AppError from "../utils/app-error.js";

let nextId = disenos.length + 1;

// el precio final depende del IVA y la moneda del .env
function conPrecio(diseno) {
    const iva = config.estudio.ivaPorcentaje;
    const precioFinal = Math.round(diseno.precioBase * (1 + iva / 100) * 100) / 100;
    return { ...diseno, iva: `${iva}%`, precioFinal, moneda: config.estudio.moneda };
}

function findAll() {
    return disenos.map(conPrecio);
}

function findById(id) {
    if (!Number.isInteger(id)) {
        throw new AppError(400, "El id del diseno debe ser un numero");
    }

    const diseno = disenos.find((d) => d.id === id);
    if (!diseno) {
        throw new AppError(404, `No existe el diseno con id ${id}`);
    }
    return diseno;
}

function create(body) {
    const { nombre, estilo, precioBase } = body || {};
    const errors = [];

    if (typeof nombre !== "string" || nombre.trim() === "") errors.push("nombre es obligatorio");
    if (typeof estilo !== "string" || estilo.trim() === "") errors.push("estilo es obligatorio");
    if (typeof precioBase !== "number" || precioBase <= 0) errors.push("precioBase debe ser mayor a 0");

    if (errors.length > 0) {
        throw new AppError(400, "Datos invalidos", errors);
    }

    const nuevo = { id: nextId++, nombre: nombre.trim(), estilo: estilo.trim(), precioBase };
    disenos.push(nuevo);
    return conPrecio(nuevo);
}

export { findAll, findById, create, conPrecio };
