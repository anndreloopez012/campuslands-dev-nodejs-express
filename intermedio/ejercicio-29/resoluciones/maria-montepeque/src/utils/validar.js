import AppError from "./app-error.js";

// reglas chiquitas que antes estaban copiadas en cada ruta
export const esTextoEntre = (valor, min, max = Infinity) =>
    typeof valor === "string" && valor.trim().length >= min && valor.trim().length <= max;

export const esEnteroEntre = (valor, min, max = Infinity) =>
    Number.isInteger(valor) && valor >= min && valor <= max;

// si hay errores tira el 400 con la lista, igual que antes
export function exigirSinErrores(errores) {
    if (errores.length > 0) {
        throw new AppError(400, "Datos invalidos", errores);
    }
}

// antes este bloque estaba 4 veces
export function parsearId(texto) {
    const id = Number(texto);
    if (!Number.isInteger(id) || id < 1) {
        throw new AppError(400, "El id debe ser un numero entero positivo");
    }
    return id;
}
