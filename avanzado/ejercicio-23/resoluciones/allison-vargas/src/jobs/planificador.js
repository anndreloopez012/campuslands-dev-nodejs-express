import { crear } from '../errores/index.js';
import { parsearCron, siguiente } from './cron.js';

const MAX_HISTORIAL = 20;

export function crearPlanificador({ reloj, registro = () => {} }) {
  const jobs = new Map();
  let temporizador = null;

  const publico = (job) => ({
    nombre: job.nombre,
    descripcion: job.descripcion,
    cron: job.cron.expresion,
    activo: job.activo,
    ejecutando: job.ejecutando,
    timeoutMs: job.timeoutMs,
    proximaEjecucion: job.activo ? job.proxima.toISOString() : null,
    ultima: job.historial.at(-1) ?? null,
    ejecuciones: job.contadores,
  });

  function job(nombre) {
    const encontrado = jobs.get(nombre);
    if (!encontrado) throw crear('JOB_NO_ENCONTRADO', { nombre });
    return encontrado;
  }

  function anotar(actual, entrada) {
    actual.historial.push(entrada);
    if (actual.historial.length > MAX_HISTORIAL) actual.historial.shift();
    actual.contadores[entrada.resultado] = (actual.contadores[entrada.resultado] ?? 0) + 1;
    registro({ job: actual.nombre, ...entrada });
  }

  async function correr(actual, origen) {
    const inicio = reloj();
    actual.ejecutando = true;
    const controlador = new AbortController();
    let temporizadorLimite;
    const limite = new Promise((_, rechazar) => {
      temporizadorLimite = setTimeout(() => {
        controlador.abort();
        rechazar(Object.assign(new Error(`supero ${actual.timeoutMs} ms`), { esTimeout: true }));
      }, actual.timeoutMs);
    });
    let entrada;
    try {
      const detalle = await Promise.race([actual.tarea({ signal: controlador.signal, ahora: inicio }), limite]);
      entrada = { resultado: 'exito', detalle: detalle ?? null };
    } catch (error) {
      entrada = { resultado: error.esTimeout ? 'timeout' : 'error', detalle: error.message };
    } finally {
      clearTimeout(temporizadorLimite);
      actual.ejecutando = false;
    }
    const fin = reloj();
    anotar(actual, {
      origen, inicio: inicio.toISOString(), fin: fin.toISOString(), duracionMs: fin - inicio, ...entrada,
    });
    return actual.historial.at(-1);
  }

  const api = {
    registrar({
      nombre, descripcion, cron, tarea, timeoutMs = 30_000,
    }) {
      if (jobs.has(nombre)) throw new TypeError(`Job repetido: ${nombre}`);
      const expresion = parsearCron(cron);
      jobs.set(nombre, {
        nombre,
        descripcion,
        cron: expresion,
        tarea,
        timeoutMs,
        activo: true,
        ejecutando: false,
        proxima: siguiente(expresion, reloj()),
        historial: [],
        contadores: {},
      });
    },

    // revisa que jobs vencieron. Si el servidor estuvo detenido y se perdieron varias ejecuciones,
    // se corre UNA sola vez y se agenda la siguiente desde ahora (no se ponen al dia todas las perdidas).
    async tick() {
      const ahora = reloj();
      const lanzados = [];
      for (const actual of jobs.values()) {
        if (!actual.activo || actual.proxima > ahora) continue;
        const programada = actual.proxima;
        actual.proxima = siguiente(actual.cron, ahora);
        if (actual.ejecutando) {
          // sin solapamiento: si la ejecucion anterior sigue corriendo, esta se omite
          anotar(actual, {
            origen: 'cron', inicio: ahora.toISOString(), fin: ahora.toISOString(), duracionMs: 0, resultado: 'omitida', detalle: 'la ejecucion anterior sigue en curso',
          });
          continue;
        }
        lanzados.push(correr(actual, 'cron').then((r) => ({ ...r, programada: programada.toISOString() })));
      }
      return Promise.all(lanzados);
    },

    async ejecutarAhora(nombre) {
      const actual = job(nombre);
      if (actual.ejecutando) throw crear('JOB_EN_EJECUCION', { nombre });
      return correr(actual, 'manual');
    },

    pausar(nombre) {
      const actual = job(nombre);
      actual.activo = false;
      return publico(actual);
    },

    reanudar(nombre) {
      const actual = job(nombre);
      if (!actual.activo) {
        actual.activo = true;
        actual.proxima = siguiente(actual.cron, reloj());
      }
      return publico(actual);
    },

    listar: () => [...jobs.values()].map(publico),
    obtener: (nombre) => publico(job(nombre)),
    historial: (nombre) => [...job(nombre).historial].reverse(),

    iniciar(intervaloMs = 15_000) {
      if (temporizador) return;
      temporizador = setInterval(() => { api.tick(); }, intervaloMs);
      temporizador.unref();
    },
    detener() {
      clearInterval(temporizador);
      temporizador = null;
    },
  };
  return api;
}
