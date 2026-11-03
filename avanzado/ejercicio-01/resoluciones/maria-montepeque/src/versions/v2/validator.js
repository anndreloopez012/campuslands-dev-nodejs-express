import AppError from "../../utils/app-error.js";
import { CLASES } from "../../services/personajes.service.js";

// v2 junta todos los errores y acepta stats.fuerzaExtra (0 a 5)
export function validarCrearV2(body = {}) {
    const errores = [];

    if (typeof body.nombre !== "string" || body.nombre.trim().length < 3 || body.nombre.trim().length > 20) {
        errores.push("nombre debe tener entre 3 y 20 letras");
    }
    if (!CLASES.includes(body.clase)) {
        errores.push(`clase debe ser una de: ${CLASES.join(", ")}`);
    }

    const extra = body.stats?.fuerzaExtra;
    if (body.stats !== undefined && (typeof body.stats !== "object" || body.stats === null)) {
        errores.push("stats debe ser un objeto");
    } else if (extra !== undefined && (!Number.isInteger(extra) || extra < 0 || extra > 5)) {
        errores.push("stats.fuerzaExtra debe ser un entero de 0 a 5");
    }

    if (errores.length > 0) {
        throw new AppError(400, "Datos invalidos", errores);
    }

    return { nombre: body.nombre.trim(), clase: body.clase, fuerzaExtra: extra ?? 0 };
}

// page y limit para la lista
export function leerPaginacion(query) {
    const page = query.page === undefined ? 1 : Number(query.page);
    const limit = query.limit === undefined ? 10 : Number(query.limit);

    if (!Number.isInteger(page) || page < 1) throw new AppError(400, "page debe ser un entero mayor a 0");
    if (!Number.isInteger(limit) || limit < 1 || limit > 50) throw new AppError(400, "limit debe ser un entero de 1 a 50");

    return { page, limit };
}

export function leerId(texto) {
    const id = Number(texto);
    if (!Number.isInteger(id) || id < 1) {
        throw new AppError(400, "El id debe ser un numero entero positivo");
    }
    return id;
}
