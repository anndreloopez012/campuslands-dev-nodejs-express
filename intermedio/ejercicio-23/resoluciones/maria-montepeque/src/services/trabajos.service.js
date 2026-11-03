import { trabajos, siguienteId } from "../data/db.js";
import AppError from "../utils/app-error.js";
import { cotizar } from "./cotizacion.service.js";

// a que estados se puede pasar desde cada estado
const TRANSICIONES = {
    pendiente: ["en_proceso", "cancelado"],
    en_proceso: ["terminado", "cancelado"],
    terminado: [],
    cancelado: []
};

function findAll(estado) {
    if (estado === undefined) return trabajos;

    if (!Object.hasOwn(TRANSICIONES, estado)) {
        throw new AppError(400, `estado debe ser uno de: ${Object.keys(TRANSICIONES).join(", ")}`);
    }
    return trabajos.filter((t) => t.estado === estado);
}

function findById(id) {
    if (!Number.isInteger(id)) {
        throw new AppError(400, "El id del trabajo debe ser un numero");
    }

    const trabajo = trabajos.find((t) => t.id === id);
    if (!trabajo) {
        throw new AppError(404, `No existe el trabajo con id ${id}`);
    }
    return trabajo;
}

function create(body) {
    const { cliente, proceso, material, metros } = body || {};

    if (typeof cliente !== "string" || cliente.trim() === "") {
        throw new AppError(400, "Datos invalidos", ["cliente es obligatorio"]);
    }

    // reuso la cotizacion para validar y calcular el costo
    const { costo } = cotizar({ proceso, material, metros });

    const nuevo = { id: siguienteId(), cliente: cliente.trim(), proceso, material, metros, costo, estado: "pendiente" };
    trabajos.push(nuevo);
    return nuevo;
}

function cambiarEstado(id, body) {
    const trabajo = findById(id);
    const { estado } = body || {};

    if (!Object.hasOwn(TRANSICIONES, estado)) {
        throw new AppError(400, `estado debe ser uno de: ${Object.keys(TRANSICIONES).join(", ")}`);
    }

    const permitidos = TRANSICIONES[trabajo.estado];
    if (!permitidos.includes(estado)) {
        throw new AppError(409, `No se puede pasar de ${trabajo.estado} a ${estado}`);
    }

    trabajo.estado = estado;
    return trabajo;
}

export { findAll, findById, create, cambiarEstado, TRANSICIONES };
