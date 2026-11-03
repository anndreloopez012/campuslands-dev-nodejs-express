import { db } from "../data/db.js";
import AppError from "../utils/app-error.js";
import { esEntero } from "../utils/validar.js";

export function listar({ sinStock } = {}) {
    if (sinStock === "true") return db.repuestos.filter((r) => r.stock === 0);
    return db.repuestos;
}

export function buscar(id) {
    const repuesto = db.repuestos.find((r) => r.id === id);
    if (!repuesto) {
        throw new AppError(404, `No existe el repuesto con id ${id}`);
    }
    return repuesto;
}

export function cambiarStock(id, body = {}) {
    const repuesto = buscar(id);

    if (!esEntero(body.stock, 0, 10_000)) {
        throw new AppError(400, "Datos invalidos", ["stock debe ser un entero de 0 a 10000"]);
    }

    repuesto.stock = body.stock;
    return repuesto;
}

// saca del inventario, si no alcanza no toca nada
export function descontar(repuesto, cantidad) {
    if (repuesto.stock < cantidad) {
        throw new AppError(409, `Solo hay ${repuesto.stock} de "${repuesto.nombre}" en bodega`);
    }
    repuesto.stock -= cantidad;
}
