import config from "../config/env.js";
import { citas } from "../data/db.js";
import AppError from "../utils/app-error.js";
import * as disenosService from "./disenos.service.js";

let nextId = citas.length + 1;

function findAll() {
    return citas;
}

function create(body) {
    // el estudio puede apagar las citas desde el .env sin tocar codigo
    if (!config.citas.permitidas) {
        throw new AppError(503, "Por ahora no estamos recibiendo citas");
    }

    const { disenoId, cliente, fecha } = body || {};
    const errors = [];

    if (!Number.isInteger(disenoId)) errors.push("disenoId debe ser un numero entero");
    if (typeof cliente !== "string" || cliente.trim() === "") errors.push("cliente es obligatorio");
    if (typeof fecha !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(fecha) || isNaN(Date.parse(fecha))) {
        errors.push("fecha debe tener el formato YYYY-MM-DD");
    }

    if (errors.length > 0) {
        throw new AppError(400, "Datos invalidos", errors);
    }

    const diseno = disenosService.findById(disenoId);

    // el limite por dia tambien sale del .env
    const delDia = citas.filter((c) => c.fecha === fecha).length;
    if (delDia >= config.citas.maxPorDia) {
        throw new AppError(409, `Ya no hay espacio el ${fecha}, el maximo es ${config.citas.maxPorDia} citas por dia`);
    }

    const nueva = { id: nextId++, disenoId, cliente: cliente.trim(), fecha };
    citas.push(nueva);

    return { ...nueva, diseno: disenosService.conPrecio(diseno) };
}

export { findAll, create };
