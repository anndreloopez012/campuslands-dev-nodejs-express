// cache en memoria hecha a mano
//
// - TTL: cada dato vence despues de un tiempo
// - LRU: si se llena, se borra el que hace mas tiempo que nadie usa
// - etiquetas: para borrar de una vez todo lo relacionado (ej. todo lo del auto 3)
// - en vuelo: si 10 piden lo mismo a la vez y no esta, se busca UNA sola vez

export function crearCache({ ttlMs = 30_000, maxEntradas = 100 } = {}) {
    // Map recuerda el orden en que se metieron las claves:
    // la primera es la mas vieja, asi el LRU es facil
    const entradas = new Map();
    const enVuelo = new Map();
    const stats = { hits: 0, misses: 0, expiradas: 0, desalojadas: 0, invalidadas: 0 };

    function leer(clave) {
        const entrada = entradas.get(clave);
        if (!entrada) return undefined;

        if (Date.now() >= entrada.venceEn) {
            entradas.delete(clave);
            stats.expiradas++;
            return undefined;
        }

        // la saco y la vuelvo a meter para que quede como la mas reciente
        entradas.delete(clave);
        entradas.set(clave, entrada);
        return entrada;
    }

    function guardar(clave, valor, { ttl = ttlMs, etiquetas = [] } = {}) {
        entradas.delete(clave);
        entradas.set(clave, { valor, guardadoEn: Date.now(), venceEn: Date.now() + ttl, etiquetas });

        // si me pase del maximo, borro la mas vieja (la primera del Map)
        while (entradas.size > maxEntradas) {
            const masVieja = entradas.keys().next().value;
            entradas.delete(masVieja);
            stats.desalojadas++;
        }
    }

    // busca en la cache y si no esta llama a "buscar" y guarda el resultado
    // devuelve tambien si fue HIT o MISS y cuantos segundos tiene el dato
    async function obtener(clave, buscar, opciones = {}) {
        const entrada = leer(clave);
        if (entrada) {
            stats.hits++;
            return { valor: entrada.valor, estado: "HIT", edadSeg: Math.floor((Date.now() - entrada.guardadoEn) / 1000) };
        }

        stats.misses++;

        // si ya hay alguien buscando esta clave, espero su resultado en vez de buscar otra vez
        if (enVuelo.has(clave)) {
            const valor = await enVuelo.get(clave);
            return { valor, estado: "MISS", edadSeg: 0 };
        }

        const promesa = (async () => {
            try {
                const valor = await buscar();
                guardar(clave, valor, opciones);
                return valor;
            } finally {
                enVuelo.delete(clave);
            }
        })();
        enVuelo.set(clave, promesa);

        return { valor: await promesa, estado: "MISS", edadSeg: 0 };
    }

    function invalidar(clave) {
        if (entradas.delete(clave)) stats.invalidadas++;
    }

    // borra todas las entradas que tengan esa etiqueta
    function invalidarEtiqueta(etiqueta) {
        let borradas = 0;
        for (const [clave, entrada] of entradas) {
            if (entrada.etiquetas.includes(etiqueta)) {
                entradas.delete(clave);
                borradas++;
            }
        }
        stats.invalidadas += borradas;
        return borradas;
    }

    function limpiar() {
        stats.invalidadas += entradas.size;
        entradas.clear();
    }

    function estadisticas() {
        const consultas = stats.hits + stats.misses;
        return {
            ...stats,
            entradas: entradas.size,
            maxEntradas,
            ttlMs,
            // porcentaje de veces que se encontro en la cache
            tasaAcierto: consultas === 0 ? 0 : Math.round((stats.hits / consultas) * 100)
        };
    }

    return { obtener, invalidar, invalidarEtiqueta, limpiar, estadisticas, claves: () => [...entradas.keys()] };
}
