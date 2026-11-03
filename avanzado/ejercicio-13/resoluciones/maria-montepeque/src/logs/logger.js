// logger estructurado hecho a mano (la idea de pino o winston)
//
// en vez de console.log("se creo la mision 3") escribe una linea JSON:
//   {"time":"...","level":"info","msg":"mision creada","requestId":"...","misionId":3}
// asi las herramientas de logs (Loki, Datadog, CloudWatch) pueden filtrar por campo

export const NIVELES = { debug: 10, info: 20, warn: 30, error: 40 };

// llaves que nunca deben quedar escritas en un log
const SENSIBLES = ["password", "contrasena", "token", "authorization", "cookie", "codigoacceso", "tarjeta", "secret"];
export const OCULTO = "[OCULTO]";

// copia el objeto tapando lo sensible, tambien adentro de objetos y arreglos
export function redactar(valor, profundidad = 0) {
    if (profundidad > 6 || valor === null || typeof valor !== "object") return valor;
    if (valor instanceof Error) return { tipo: valor.name, mensaje: valor.message, stack: valor.stack };
    if (Array.isArray(valor)) return valor.map((v) => redactar(v, profundidad + 1));

    const copia = {};
    for (const [clave, v] of Object.entries(valor)) {
        copia[clave] = SENSIBLES.includes(clave.toLowerCase()) ? OCULTO : redactar(v, profundidad + 1);
    }
    return copia;
}

// destino: funcion que recibe la linea de texto (por defecto stdout)
export function crearLogger({ nivel = "info", destino = (linea) => process.stdout.write(linea + "\n"), contexto = {} } = {}) {
    if (!Object.hasOwn(NIVELES, nivel)) throw new Error(`nivel de log invalido: ${nivel}`);
    const minimo = NIVELES[nivel];

    function escribir(nivelLinea, msg, datos = {}) {
        if (NIVELES[nivelLinea] < minimo) return;
        const linea = { time: new Date().toISOString(), level: nivelLinea, msg, ...redactar(contexto), ...redactar(datos) };
        destino(JSON.stringify(linea));
    }

    return {
        debug: (msg, datos) => escribir("debug", msg, datos),
        info: (msg, datos) => escribir("info", msg, datos),
        warn: (msg, datos) => escribir("warn", msg, datos),
        error: (msg, datos) => escribir("error", msg, datos),
        // un logger hijo agrega contexto fijo (por ejemplo el requestId)
        hijo: (extra) => crearLogger({ nivel, destino, contexto: { ...contexto, ...extra } }),
        nivel
    };
}
