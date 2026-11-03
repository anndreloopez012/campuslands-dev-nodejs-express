// limitador de concurrencia (como un semaforo)
// - como maximo `max` tareas corriendo a la vez
// - las demas esperan en una cola FIFO
// - si la cola esta llena se rechaza de una vez (mejor decir "no" que tumbar el servidor)

export class ColaLlena extends Error {
    constructor(maxCola) {
        super(`La cola esta llena (${maxCola} esperando)`);
        this.name = "ColaLlena";
    }
}

export function crearLimitador({ max = 2, maxCola = 10 } = {}) {
    if (!Number.isInteger(max) || max < 1) throw new Error("max debe ser un entero mayor a 0");

    let activos = 0;
    let pico = 0;
    let completadas = 0;
    let fallidas = 0;
    const cola = [];

    // saca la siguiente de la cola si hay espacio
    function siguiente() {
        while (activos < max && cola.length > 0) {
            const { tarea, resolver, rechazar } = cola.shift();
            correr(tarea).then(resolver, rechazar);
        }
    }

    async function correr(tarea) {
        activos++;
        pico = Math.max(pico, activos);
        try {
            const resultado = await tarea();
            completadas++;
            return resultado;
        } catch (err) {
            fallidas++;
            throw err;
        } finally {
            // pase lo que pase se libera el lugar (si no, se quedaria trabado para siempre)
            activos--;
            siguiente();
        }
    }

    function ejecutar(tarea) {
        if (activos < max) return correr(tarea);
        if (cola.length >= maxCola) return Promise.reject(new ColaLlena(maxCola));
        return new Promise((resolver, rechazar) => cola.push({ tarea, resolver, rechazar }));
    }

    // cuantas mas caben antes de rechazar
    const hayLugar = () => activos < max || cola.length < maxCola;

    const estado = () => ({ max, maxCola, activos, enCola: cola.length, pico, completadas, fallidas });

    return { ejecutar, hayLugar, estado };
}
