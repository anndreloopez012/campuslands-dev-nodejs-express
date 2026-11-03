// limpiar texto que manda el usuario

// caracteres de control (menos tab y salto de linea) y caracteres invisibles de ancho cero
// los invisibles sirven para hacer que "admin" y "ad​min" parezcan iguales
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const INVISIBLES = /[​-‍⁠﻿]/g;

export function limpiarTexto(valor, { max = 200, multilinea = false } = {}) {
    if (typeof valor !== "string") return null;

    let texto = valor
        // NFC: la "e" con tilde puede venir como 1 o 2 caracteres, las dejo iguales
        .normalize("NFC")
        .replace(CONTROL, "")
        .replace(INVISIBLES, "");

    texto = multilinea
        ? texto.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n")
        : texto.replace(/\s+/g, " ");

    texto = texto.trim();
    // corto por caracteres reales (un emoji puede ocupar 2 posiciones en JS)
    return [...texto].slice(0, max).join("");
}

// para textos donde no se acepta HTML (reseñas): quito todas las etiquetas
// ojo: igual hay que escapar al mostrar en HTML (avanzado 15), esto es una capa extra
export function quitarHtml(texto) {
    return texto
        // primero los bloques peligrosos completos, con su contenido
        .replace(/<(script|style|iframe|object)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
        // despues cualquier etiqueta suelta
        .replace(/<\/?[a-z][^>]*>/gi, "")
        // y los < sueltos que quedaron
        .replace(/</g, "")
        .trim();
}

// un numero que de verdad sea un numero (no "1e309" = Infinity, ni "", ni " 12 ")
export function numeroEstricto(valor, { min = -Infinity, max = Infinity, entero = false } = {}) {
    if (typeof valor !== "number" && typeof valor !== "string") return null;
    if (typeof valor === "string" && !/^-?\d+(\.\d+)?$/.test(valor)) return null;
    const n = Number(valor);
    if (!Number.isFinite(n) || (entero && !Number.isInteger(n)) || n < min || n > max) return null;
    // -0 lo dejo como 0
    return n === 0 ? 0 : n;
}
