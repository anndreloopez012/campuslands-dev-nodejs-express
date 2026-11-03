// cola de tareas en memoria
//
// la API no hace el trabajo pesado en la peticion: lo deja en la cola y responde rapido
// unos "workers" van sacando tareas de la cola y las hacen de a pocas
//
// estados de una tarea:
//   pendiente -> en_proceso -> completada
//                    |
//                    +-> (fallo) -> esperando_reintento -> pendiente -> ...
//                    +-> (fallo y no quedan intentos) -> fallida (va a la lista de muertas)

const PRIORIDADES = { alta: 0, normal: 1, baja: 2 };

export function crearCola({ concurrencia = 2, backoffBaseMs = 500, timeoutMs = 5000, maxIntentos = 3 } = {}) {
    const tareas = new Map();
    const pendientes = []; // ids en espera de un worker
    const muertas = []; // ids que fallaron todos sus intentos (dead letter queue)
    const trabajos = new Map(); // tipo -> funcion que hace el trabajo
    const esperando = new Map(); // id -> funciones que esperan que termine
    const timers = new Set();

    let siguienteId = 1;
    let activas = 0;
    let pausada = false;

    function registrar(tipo, fn) {
        trabajos.set(tipo, fn);
    }

    function encolar(tipo, datos, opciones = {}) {
        if (!trabajos.has(tipo)) {
            throw new Error(`No hay un trabajo registrado para "${tipo}"`);
        }
        const prioridad = opciones.prioridad ?? "normal";
        if (!Object.hasOwn(PRIORIDADES, prioridad)) {
            throw new Error(`prioridad debe ser alta, normal o baja`);
        }

        const tarea = {
            id: siguienteId++,
            tipo,
            datos,
            prioridad,
            estado: "pendiente",
            intentos: 0,
            maxIntentos: opciones.maxIntentos ?? maxIntentos,
            errores: [],
            resultado: null,
            padreId: opciones.padreId ?? null,
            creada: new Date().toISOString(),
            terminada: null,
            proximoIntentoEnMs: null
        };

        tareas.set(tarea.id, tarea);
        meterEnPendientes(tarea.id);
        // el trabajo empieza despues, no dentro de encolar
        queueMicrotask(bombear);
        return copia(tarea);
    }

    // ordena por prioridad y, a igual prioridad, la que llego primero
    function meterEnPendientes(id) {
        pendientes.push(id);
        pendientes.sort((a, b) => {
            const ta = tareas.get(a);
            const tb = tareas.get(b);
            return PRIORIDADES[ta.prioridad] - PRIORIDADES[tb.prioridad] || ta.id - tb.id;
        });
    }

    // saca tareas mientras haya workers libres
    function bombear() {
        while (!pausada && activas < concurrencia && pendientes.length > 0) {
            const id = pendientes.shift();
            ejecutar(tareas.get(id));
        }
    }

    async function ejecutar(tarea) {
        activas++;
        tarea.estado = "en_proceso";
        tarea.intentos++;
        tarea.proximoIntentoEnMs = null;

        try {
            const contexto = {
                intento: tarea.intentos,
                // un trabajo puede encolar otro (tareas encadenadas)
                encolar: (tipo, datos, opciones = {}) => encolar(tipo, datos, { ...opciones, padreId: tarea.id })
            };
            tarea.resultado = await conTimeout(trabajos.get(tarea.tipo)(tarea.datos, contexto), timeoutMs);
            tarea.estado = "completada";
            terminar(tarea);
        } catch (error) {
            tarea.errores.push({ intento: tarea.intentos, mensaje: error.message });

            if (tarea.intentos < tarea.maxIntentos) {
                // backoff exponencial: espera 1x, 2x, 4x... antes de reintentar
                // asi si el problema es pasajero (un servicio caido) le da tiempo de volver
                const espera = backoffBaseMs * 2 ** (tarea.intentos - 1);
                tarea.estado = "esperando_reintento";
                tarea.proximoIntentoEnMs = espera;

                const timer = setTimeout(() => {
                    timers.delete(timer);
                    tarea.estado = "pendiente";
                    meterEnPendientes(tarea.id);
                    bombear();
                }, espera);
                timers.add(timer);
            } else {
                tarea.estado = "fallida";
                muertas.push(tarea.id);
                terminar(tarea);
            }
        } finally {
            activas--;
            bombear();
        }
    }

    // si el trabajo tarda mas de la cuenta lo doy por fallido
    // ojo: la promesa original sigue corriendo, JS no la puede cancelar
    function conTimeout(promesa, ms) {
        let timer;
        const limite = new Promise((_, reject) => {
            timer = setTimeout(() => reject(new Error(`Se paso del tiempo limite de ${ms}ms`)), ms);
        });
        return Promise.race([promesa, limite]).finally(() => clearTimeout(timer));
    }

    function terminar(tarea) {
        tarea.terminada = new Date().toISOString();
        for (const resolver of esperando.get(tarea.id) || []) resolver(copia(tarea));
        esperando.delete(tarea.id);
    }

    // promesa que se cumple cuando la tarea queda completada o fallida
    function cuandoTermine(id) {
        const tarea = tareas.get(id);
        if (!tarea) return Promise.reject(new Error(`No existe la tarea ${id}`));
        if (tarea.estado === "completada" || tarea.estado === "fallida") return Promise.resolve(copia(tarea));

        return new Promise((resolve) => {
            esperando.set(id, [...(esperando.get(id) || []), resolve]);
        });
    }

    // volver a intentar una tarea muerta (por ejemplo despues de arreglar el problema)
    function reintentar(id) {
        const tarea = tareas.get(id);
        if (!tarea) return null;
        if (tarea.estado !== "fallida") {
            throw new Error(`Solo se reintentan tareas fallidas, esta esta "${tarea.estado}"`);
        }

        muertas.splice(muertas.indexOf(id), 1);
        tarea.estado = "pendiente";
        tarea.intentos = 0;
        tarea.terminada = null;
        meterEnPendientes(id);
        queueMicrotask(bombear);
        return copia(tarea);
    }

    function pausar() {
        pausada = true;
    }

    function reanudar() {
        pausada = false;
        bombear();
    }

    // cierre ordenado: no toma tareas nuevas y espera las que estan en proceso
    async function cerrar() {
        pausar();
        timers.forEach(clearTimeout);
        timers.clear();
        while (activas > 0) {
            await new Promise((resolve) => setTimeout(resolve, 5));
        }
    }

    function obtener(id) {
        const tarea = tareas.get(id);
        return tarea ? copia(tarea) : null;
    }

    function listar({ estado } = {}) {
        return [...tareas.values()].filter((t) => !estado || t.estado === estado).map(copia);
    }

    function estadisticas() {
        const porEstado = { pendiente: 0, en_proceso: 0, esperando_reintento: 0, completada: 0, fallida: 0 };
        for (const t of tareas.values()) porEstado[t.estado]++;
        return { pausada, concurrencia, activas, enCola: pendientes.length, muertas: muertas.length, porEstado };
    }

    const copia = (tarea) => structuredClone(tarea);

    return { registrar, encolar, obtener, listar, cuandoTermine, reintentar, pausar, reanudar, cerrar, estadisticas, muertas: () => [...muertas] };
}
