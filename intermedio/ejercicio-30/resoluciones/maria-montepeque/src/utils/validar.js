import AppError from "./app-error.js";

export const esTexto = (valor, min = 1, max = Infinity) =>
    typeof valor === "string" && valor.trim().length >= min && valor.trim().length <= max;

export const esEntero = (valor, min = -Infinity, max = Infinity) =>
    Number.isInteger(valor) && valor >= min && valor <= max;

export function exigirSinErrores(errores) {
    if (errores.length > 0) {
        throw new AppError(400, "Datos invalidos", errores);
    }
}

export function parsearId(texto, de = "del recurso") {
    const id = Number(texto);
    if (!Number.isInteger(id) || id < 1) {
        throw new AppError(400, `El id ${de} debe ser un numero entero positivo`);
    }
    return id;
}

// minusculas y sin tildes, para buscar
export function normalizar(texto) {
    return String(texto).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}
