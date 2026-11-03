import { esTexto, esEntero, exigirSinErrores } from "../utils/validar.js";

// placas de moto en Guatemala: M + 3 numeros + 3 letras, ej. M123ABC
export const FORMATO_PLACA = /^M\d{3}[A-Z]{3}$/;

export function validarMotoNueva(body = {}) {
    const errores = [];
    const anioMaximo = new Date().getFullYear() + 1;
    const placa = typeof body.placa === "string" ? body.placa.trim().toUpperCase() : body.placa;

    if (typeof placa !== "string" || !FORMATO_PLACA.test(placa)) errores.push("placa debe tener el formato M123ABC");
    if (!esTexto(body.marca, 2, 30)) errores.push("marca debe tener entre 2 y 30 letras");
    if (!esTexto(body.modelo, 1, 40)) errores.push("modelo es obligatorio");
    if (!esEntero(body.anio, 1980, anioMaximo)) errores.push(`anio debe ser un entero entre 1980 y ${anioMaximo}`);
    if (!esEntero(body.cilindraje, 50, 2000)) errores.push("cilindraje debe ser un entero entre 50 y 2000");
    if (!esEntero(body.km, 0, 1_000_000)) errores.push("km debe ser un entero de 0 para arriba");

    const p = body.propietario;
    if (typeof p !== "object" || p === null || !esTexto(p.nombre, 3, 60)) {
        errores.push("propietario.nombre es obligatorio");
    }
    if (typeof p !== "object" || p === null || typeof p.telefono !== "string" || !/^\d{8}$/.test(p.telefono)) {
        errores.push("propietario.telefono debe tener 8 numeros");
    }

    exigirSinErrores(errores);
}
