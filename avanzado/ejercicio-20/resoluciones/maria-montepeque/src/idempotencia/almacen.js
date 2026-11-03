import { createHash } from "node:crypto";

// guarda que respuesta se dio para cada Idempotency-Key
// estados: "en_proceso" (todavia trabajando) y "completo" (ya hay respuesta guardada)

// huella del pedido: si llega la misma llave con OTRO body, es un error del cliente
export function huella(metodo, ruta, body) {
    return createHash("sha256").update(`${metodo} ${ruta} ${JSON.stringify(body ?? null)}`).digest("hex");
}

export function crearAlmacen({ ttlMs = 24 * 60 * 60 * 1000, reloj = Date.now } = {}) {
    const registros = new Map();

    function vigente(clave) {
        const r = registros.get(clave);
        if (r && reloj() - r.creado > ttlMs) {
            // ya vencio: se puede usar la llave otra vez
            registros.delete(clave);
            return undefined;
        }
        return r;
    }

    // intenta apartar la llave. Devuelve lo que habia (si habia algo) o null si la aparto
    function reservar(clave, huellaPedido) {
        const existente = vigente(clave);
        if (existente) return existente;
        registros.set(clave, { estado: "en_proceso", huella: huellaPedido, creado: reloj() });
        return null;
    }

    function completar(clave, respuesta) {
        const r = registros.get(clave);
        if (r) Object.assign(r, { estado: "completo", respuesta });
    }

    // si fallo por algo del servidor, se suelta la llave para que el cliente reintente
    const liberar = (clave) => registros.delete(clave);

    return { reservar, completar, liberar, ver: vigente, total: () => registros.size };
}
