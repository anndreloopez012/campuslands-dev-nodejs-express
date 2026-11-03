import { Writable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { separarLineas, limitarBytes } from "../streams/lineas.js";

export const GENEROS = ["pop", "rock", "reggaeton", "bachata", "salsa", "cumbia", "jazz", "electronica", "hiphop", "marimba"];
export const MODOS = ["insertar", "upsert", "saltar"];

// ISRC: 2 letras de pais, 3 del registrante, 2 del anio y 5 numeros. Ej: USUM71703861
const ISRC = /^[A-Z]{2}[A-Z0-9]{3}\d{7}$/;

export function validarCancion(obj) {
    const errores = [];
    const anioMax = new Date().getFullYear();

    if (typeof obj !== "object" || obj === null || Array.isArray(obj)) return { errores: ["la linea no es un objeto JSON"] };

    const isrc = typeof obj.isrc === "string" ? obj.isrc.trim().toUpperCase().replaceAll("-", "") : obj.isrc;
    if (typeof isrc !== "string" || !ISRC.test(isrc)) errores.push("isrc no es valido (ej. USUM71703861)");
    if (typeof obj.titulo !== "string" || !obj.titulo.trim() || obj.titulo.length > 200) errores.push("titulo es obligatorio");
    if (typeof obj.artista !== "string" || !obj.artista.trim()) errores.push("artista es obligatorio");
    if (!GENEROS.includes(obj.genero)) errores.push(`genero debe ser uno de: ${GENEROS.join(", ")}`);
    if (!Number.isInteger(obj.anio) || obj.anio < 1900 || obj.anio > anioMax) errores.push(`anio debe estar entre 1900 y ${anioMax}`);
    if (!Number.isInteger(obj.duracionSeg) || obj.duracionSeg < 30 || obj.duracionSeg > 1200) errores.push("duracionSeg debe estar entre 30 y 1200");

    if (errores.length > 0) return { errores };
    return { cancion: { isrc, titulo: obj.titulo.trim(), artista: obj.artista.trim(), genero: obj.genero, anio: obj.anio, duracionSeg: obj.duracionSeg } };
}

// importa un stream NDJSON (una cancion por linea) al catalogo
//
// opciones:
//   modo: insertar (si el isrc existe se reporta como duplicado)
//         upsert   (si existe se actualiza)
//         saltar   (si existe se ignora en silencio)
//   todoONada: si hay UNA linea mala no se aplica nada
//   simular:   hace todo pero no guarda (para ver el reporte antes)
//   tamanoLote: cuantas filas se aplican juntas
export async function importar(origen, catalogo, { modo = "insertar", todoONada = false, simular = false, tamanoLote = 500, maxBytes = 20_000_000, maxErrores = 100, alAvanzar = () => {} } = {}) {
    const reporte = { lineas: 0, insertadas: 0, actualizadas: 0, saltadas: 0, duplicadas: 0, invalidas: 0, lotes: 0, errores: [], aplicado: false };
    const vistosEnArchivo = new Set();
    let lote = [];
    const pendientes = []; // para todoONada: no aplico hasta el final

    function anotarError(linea, errores) {
        reporte.invalidas++;
        if (reporte.errores.length < maxErrores) reporte.errores.push({ linea, errores });
    }

    function cerrarLote() {
        if (lote.length === 0) return;
        reporte.lotes++;
        if (todoONada) pendientes.push(lote);
        else if (!simular) catalogo.aplicarLote(lote);
        lote = [];
        alAvanzar({ ...reporte, errores: undefined });
    }

    const destino = new Writable({
        objectMode: true,
        write({ numero, linea }, _enc, listo) {
            reporte.lineas++;

            let obj;
            try {
                obj = JSON.parse(linea);
            } catch {
                anotarError(numero, ["JSON invalido"]);
                return listo();
            }

            const { cancion, errores } = validarCancion(obj);
            if (errores) {
                anotarError(numero, errores);
                return listo();
            }

            // el mismo isrc dos veces en el mismo archivo
            if (vistosEnArchivo.has(cancion.isrc)) {
                anotarError(numero, [`isrc ${cancion.isrc} repetido en el archivo`]);
                return listo();
            }
            vistosEnArchivo.add(cancion.isrc);

            if (catalogo.existe(cancion.isrc)) {
                if (modo === "insertar") {
                    reporte.duplicadas++;
                    if (reporte.errores.length < maxErrores) reporte.errores.push({ linea: numero, errores: [`isrc ${cancion.isrc} ya existe en el catalogo`] });
                    return listo();
                }
                if (modo === "saltar") {
                    reporte.saltadas++;
                    return listo();
                }
                reporte.actualizadas++;
                lote.push({ tipo: "actualizar", cancion });
            } else {
                reporte.insertadas++;
                lote.push({ tipo: "insertar", cancion });
            }

            if (lote.length >= tamanoLote) cerrarLote();
            listo();
        },
        final(listo) {
            cerrarLote();
            listo();
        }
    });

    await pipeline(origen, limitarBytes(maxBytes), separarLineas(), destino);

    const hayProblemas = reporte.invalidas > 0 || reporte.duplicadas > 0;

    if (todoONada && hayProblemas) {
        // no aplico nada: los numeros dicen lo que SE HUBIERA hecho
        reporte.aplicado = false;
        reporte.motivo = "todoONada: habia lineas con problemas, no se guardo ninguna";
    } else if (simular) {
        reporte.aplicado = false;
        reporte.motivo = "simulacion: no se guardo nada";
    } else {
        for (const l of pendientes) catalogo.aplicarLote(l);
        reporte.aplicado = true;
    }

    reporte.erroresTruncados = reporte.invalidas + reporte.duplicadas > reporte.errores.length;
    return reporte;
}
