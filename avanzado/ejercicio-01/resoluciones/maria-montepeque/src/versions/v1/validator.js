import AppError from "../../utils/app-error.js";
import { CLASES } from "../../services/personajes.service.js";

// v1 solo pide nombre y clase y responde con el primer error que encuentra
export function validarCrearV1(body = {}) {
    if (typeof body.nombre !== "string" || body.nombre.trim().length < 3) {
        throw new AppError(400, "nombre debe tener al menos 3 letras");
    }
    if (!CLASES.includes(body.clase)) {
        throw new AppError(400, "clase invalida");
    }
    return { nombre: body.nombre.trim(), clase: body.clase };
}
