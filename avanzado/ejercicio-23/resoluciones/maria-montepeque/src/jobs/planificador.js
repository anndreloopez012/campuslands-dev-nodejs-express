import { coincide, parsearCron, siguientes } from "./cron.js";

// planificador de jobs
// - cada minuto se llama a tick(fecha) y se corren los jobs que tocan
// - si un job todavia esta corriendo cuando le toca otra vez, se SALTA (no se encima)
// - cada job tiene timeout y reintentos
// - se guarda un historial corto de cada ejecucion

const MAX_HISTORIAL = 50;

function conTimeout(promesa, ms) {
    let timer;
    const limite = new Promise((_, rechazar) => {
        timer = setTimeout(() => rechazar(new Error(`timeout: tardo mas de ${ms} ms`)), ms);
    });
    return Promise.race([promesa, limite]).finally(() => clearTimeout(timer));
}

export function crearPlanificador({ reloj = () => new Date() } = {}) {
    const jobs = new Map();
    let intervalo = null;
    let ultimoMinuto = null;

    function registrar({ nombre, cron, tarea, timeoutMs = 30_000, reintentos = 0, descripcion = "" }) {
        if (jobs.has(nombre)) throw new Error(`Ya existe el job ${nombre}`);
        jobs.set(nombre, { nombre, descripcion, cron: parsearCron(cron), tarea, timeoutMs, reintentos, activo: true, corriendo: false, historial: [] });
    }

    function anotar(job, registro) {
        job.historial.unshift(registro);
        if (job.historial.length > MAX_HISTORIAL) job.historial.pop();
    }

    async function correr(job, motivo) {
        const inicio = reloj();
        if (job.corriendo) {
            const saltado = { inicio: inicio.toISOString(), motivo, estado: "saltado", detalle: "la ejecucion anterior no ha terminado" };
            anotar(job, saltado);
            return saltado;
        }

        job.corriendo = true;
        const registro = { inicio: inicio.toISOString(), motivo, estado: "corriendo", intentos: 0 };
        anotar(job, registro);
        try {
            for (let intento = 1; intento <= job.reintentos + 1; intento++) {
                registro.intentos = intento;
                try {
                    registro.resultado = await conTimeout(Promise.resolve().then(() => job.tarea({ ahora: inicio })), job.timeoutMs);
                    registro.estado = "ok";
                    delete registro.error;
                    break;
                } catch (err) {
                    registro.estado = "error";
                    registro.error = err.message;
                }
            }
        } finally {
            // siempre se libera, si no el job quedaria "corriendo" para siempre
            job.corriendo = false;
            registro.fin = reloj().toISOString();
        }
        return registro;
    }

    // revisa que jobs tocan en este minuto (solo una vez por minuto)
    function tick(fecha = reloj()) {
        const minuto = Math.floor(fecha.getTime() / 60_000);
        if (minuto === ultimoMinuto) return [];
        ultimoMinuto = minuto;

        const lanzados = [];
        for (const job of jobs.values()) {
            if (job.activo && coincide(job.cron, fecha)) lanzados.push(correr(job, "programado"));
        }
        return lanzados;
    }

    function buscar(nombre) {
        const job = jobs.get(nombre);
        if (!job) throw Object.assign(new Error(`No existe el job ${nombre}`), { status: 404 });
        return job;
    }

    const resumen = (job) => ({
        nombre: job.nombre,
        descripcion: job.descripcion,
        cron: job.cron.expresion,
        activo: job.activo,
        corriendo: job.corriendo,
        siguiente: job.activo ? siguientes(job.cron, reloj(), 1)[0]?.toISOString() ?? null : null,
        ultimaEjecucion: job.historial[0] ?? null
    });

    return {
        registrar,
        tick,
        ejecutarAhora: (nombre) => correr(buscar(nombre), "manual"),
        pausar: (nombre) => resumen(Object.assign(buscar(nombre), { activo: false })),
        reanudar: (nombre) => resumen(Object.assign(buscar(nombre), { activo: true })),
        listar: () => [...jobs.values()].map(resumen),
        historial: (nombre) => buscar(nombre).historial,
        // en el server de verdad se revisa cada 10 s (tick ignora si es el mismo minuto)
        iniciar(cadaMs = 10_000) {
            intervalo = setInterval(() => tick(), cadaMs);
            intervalo.unref();
        },
        detener: () => clearInterval(intervalo)
    };
}
