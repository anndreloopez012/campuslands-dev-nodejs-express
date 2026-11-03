import { esTexto, esEntero, exigirSinErrores } from "../utils/validar.js";

// mano de obra fija segun el tipo de trabajo, en quetzales
export const MANO_DE_OBRA = { revision: 75, mantenimiento: 150, reparacion: 300 };
export const TIPOS = Object.keys(MANO_DE_OBRA);

export const ESTADOS = ["pendiente", "en_proceso", "lista", "entregada", "cancelada"];

export function validarOrdenNueva(body = {}) {
    const errores = [];
    if (!TIPOS.includes(body.tipo)) errores.push(`tipo debe ser uno de: ${TIPOS.join(", ")}`);
    if (!esTexto(body.descripcion, 5, 300)) errores.push("descripcion debe tener entre 5 y 300 letras");
    exigirSinErrores(errores);
}

export function validarRepuestoUsado(body = {}) {
    const errores = [];
    if (!esEntero(body.repuestoId, 1)) errores.push("repuestoId debe ser un numero entero");
    if (!esEntero(body.cantidad, 1, 50)) errores.push("cantidad debe ser un entero entre 1 y 50");
    exigirSinErrores(errores);
}
