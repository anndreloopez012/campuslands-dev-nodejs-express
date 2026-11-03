import path from "node:path";

// --- query string ---

// ?marca=nike&marca=adidas llega como ["nike","adidas"] (HTTP parameter pollution)
// y ?marca[$ne]=x puede llegar como objeto. Aqui solo acepto un texto
export function textoDeQuery(valor) {
    if (valor === undefined) return undefined;
    if (typeof valor !== "string") return null;
    return valor;
}

// --- busquedas con RegExp ---

// si meto lo que escribe el usuario directo en new RegExp(), puede mandar
// "(a+)+$" y dejar el servidor colgado (ReDoS), o ".*" y saltarse el filtro
// escapo todos los caracteres especiales: queda como texto literal
export function escaparRegex(texto) {
    return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// --- nombres de archivo ---

// solo letras, numeros, guion y punto, sin empezar con punto
const NOMBRE_SEGURO = /^[a-z0-9][a-z0-9-]*\.[a-z0-9]+$/i;

// devuelve la ruta completa SOLO si queda dentro de la carpeta permitida
// evita "path traversal": ../secreto.txt, ..%2F..%2Fetc/passwd, C:\Windows...
export function rutaDentroDe(carpeta, nombre) {
    if (typeof nombre !== "string" || nombre.length > 100 || !NOMBRE_SEGURO.test(nombre)) return null;

    const base = path.resolve(carpeta);
    const completa = path.resolve(base, nombre);
    // aunque el nombre pase la regex, reviso que la ruta final siga adentro
    if (completa !== path.join(base, path.basename(completa)) || !completa.startsWith(base + path.sep)) return null;
    return completa;
}
