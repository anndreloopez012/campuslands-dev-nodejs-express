import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { parsearEnv } from "./dotenv.js";
import { ESQUEMA } from "./esquema.js";

// carga la configuracion por capas (la de abajo gana):
//   1. valores por defecto del esquema
//   2. config/<entorno>.json        (lo que cambia por entorno y no es secreto)
//   3. archivo .env                 (para desarrollo local)
//   4. variables de entorno reales  (lo que pone el servidor / docker / la nube)
// despues valida TODO y junta todos los errores (no para en el primero)

export class ErrorConfig extends Error {
    constructor(errores) {
        super(`Configuracion invalida:\n - ${errores.join("\n - ")}`);
        this.errores = errores;
    }
}

const esHoja = (def) => def && typeof def.tipo === "string";

// "30s" "5m" "1h" "250ms" -> milisegundos
export function duracionAMs(texto) {
    const m = /^(\d+)(ms|s|m|h)$/.exec(String(texto).trim());
    if (!m) return null;
    return Number(m[1]) * { ms: 1, s: 1000, m: 60_000, h: 3_600_000 }[m[2]];
}

function convertir(def, crudo, nombre) {
    switch (def.tipo) {
        case "entero": {
            const n = typeof crudo === "number" ? crudo : /^-?\d+$/.test(String(crudo).trim()) ? Number(crudo) : NaN;
            if (!Number.isInteger(n)) return { error: `${nombre} debe ser un entero (llego "${crudo}")` };
            if ((def.min !== undefined && n < def.min) || (def.max !== undefined && n > def.max)) return { error: `${nombre} debe estar entre ${def.min} y ${def.max} (llego ${n})` };
            return { valor: n };
        }
        case "booleano": {
            if (typeof crudo === "boolean") return { valor: crudo };
            const t = String(crudo).trim().toLowerCase();
            if (["true", "1", "si", "yes", "on"].includes(t)) return { valor: true };
            if (["false", "0", "no", "off", ""].includes(t)) return { valor: false };
            return { error: `${nombre} debe ser true o false (llego "${crudo}")` };
        }
        case "enum":
            return def.valores.includes(crudo) ? { valor: crudo } : { error: `${nombre} debe ser uno de ${def.valores.join(", ")} (llego "${crudo}")` };
        case "url":
            try {
                return { valor: new URL(crudo).toString().replace(/\/$/, "") };
            } catch {
                return { error: `${nombre} debe ser una url (llego "${crudo}")` };
            }
        case "duracion": {
            const ms = duracionAMs(crudo);
            return ms === null ? { error: `${nombre} debe ser una duracion como 30s, 5m o 250ms (llego "${crudo}")` } : { valor: ms };
        }
        default: {
            const texto = String(crudo);
            if (def.minLargo && texto.length < def.minLargo) return { error: `${nombre} debe tener al menos ${def.minLargo} caracteres` };
            return { valor: texto };
        }
    }
}

// recorre el esquema y arma el objeto final
function resolver(esquema, capas, entorno, errores, prefijo = "") {
    const salida = {};
    for (const [clave, def] of Object.entries(esquema)) {
        const nombre = prefijo ? `${prefijo}.${clave}` : clave;
        if (!esHoja(def)) {
            salida[clave] = resolver(def, { ...capas, archivo: capas.archivo?.[clave] }, entorno, errores, nombre);
            continue;
        }
        const desdeEnv = capas.env[def.env];
        const desdeArchivo = capas.archivo?.[clave];
        const obligatorio = def.obligatorioEn?.includes(entorno);

        // en produccion un secreto no puede venir del valor por defecto
        let crudo = desdeEnv ?? desdeArchivo ?? (obligatorio ? undefined : def.defecto);
        let origen = desdeEnv !== undefined ? "env" : desdeArchivo !== undefined ? "archivo" : "defecto";

        if (crudo === undefined || crudo === "") {
            if (obligatorio) errores.push(`${nombre} es obligatoria en ${entorno} (variable ${def.env})`);
            salida[clave] = undefined;
            continue;
        }
        if (def.secreto && desdeArchivo !== undefined) {
            errores.push(`${nombre} es secreta: no va en config/*.json, usa la variable ${def.env}`);
        }
        const { valor, error } = convertir(def, crudo, `${nombre} (${def.env}, desde ${origen})`);
        if (error) errores.push(error);
        salida[clave] = valor;
    }
    return salida;
}

// congela todo para que nadie cambie la config en tiempo de ejecucion
function congelar(obj) {
    for (const v of Object.values(obj)) if (v && typeof v === "object") congelar(v);
    return Object.freeze(obj);
}

export function cargarConfig({ env = process.env, carpeta = process.cwd(), usarArchivoEnv = true } = {}) {
    const errores = [];

    // .env (solo agrega lo que NO este ya en el entorno real)
    let variables = { ...env };
    const rutaEnv = path.join(carpeta, ".env");
    if (usarArchivoEnv && existsSync(rutaEnv)) {
        try {
            variables = { ...parsearEnv(readFileSync(rutaEnv, "utf8")), ...env };
        } catch (err) {
            errores.push(err.message);
        }
    }

    const entorno = variables.NODE_ENV ?? ESQUEMA.entorno.defecto;
    let archivo = {};
    const rutaJson = path.join(carpeta, "config", `${entorno}.json`);
    if (existsSync(rutaJson)) {
        try {
            archivo = JSON.parse(readFileSync(rutaJson, "utf8"));
        } catch {
            errores.push(`config/${entorno}.json no es un JSON valido`);
        }
    }

    const config = resolver(ESQUEMA, { env: variables, archivo }, entorno, errores);

    // reglas que dependen de varias opciones a la vez
    if (config.draft.bansPorEquipo !== undefined && config.draft.tamanoEquipo !== undefined && config.draft.bansPorEquipo > config.draft.tamanoEquipo) {
        errores.push("draft.bansPorEquipo no puede ser mayor que draft.tamanoEquipo");
    }
    if (entorno === "production" && config.urlBase?.startsWith("http://")) errores.push("urlBase debe ser https en production");

    if (errores.length > 0) throw new ErrorConfig(errores);
    return congelar(config);
}

// copia para mostrar: de los secretos solo se dice si estan puestos, nunca el valor
export function configPublica(config, esquema = ESQUEMA) {
    const salida = {};
    for (const [clave, def] of Object.entries(esquema)) {
        if (!esHoja(def)) salida[clave] = configPublica(config[clave], def);
        else if (def.secreto) salida[clave] = config[clave] ? "[configurado]" : null;
        else salida[clave] = config[clave] ?? null;
    }
    return salida;
}
