import { crear } from '../errores/index.js';
import { crearSemaforo } from './semaforo.js';

export const LIMITES = Object.freeze({
  simultaneos: 2, enCola: 5, porCliente: 2, timeoutMs: 10_000,
});

const ACTIVOS = new Set(['en_cola', 'renderizando']);

export function crearGranja({ renderizar, reloj, limites = LIMITES }) {
  const semaforo = crearSemaforo(limites.simultaneos);
  const trabajos = new Map();
  const cola = [];
  let siguienteId = 1;

  const iso = () => reloj().toISOString();
  const publico = (t) => {
    const { controlador, ...resto } = t;
    return { ...resto, posicion: t.estado === 'en_cola' ? cola.indexOf(t.id) + 1 : null };
  };

  function terminar(trabajo, estado, extra = {}) {
    Object.assign(trabajo, { estado, terminadoEn: iso(), ...extra });
  }

  async function ejecutar(trabajo) {
    let liberar;
    try {
      liberar = await semaforo.adquirir({ signal: trabajo.controlador.signal });
    } catch {
      return; // se cancelo mientras esperaba
    }
    cola.splice(cola.indexOf(trabajo.id), 1);
    trabajo.estado = 'renderizando';
    trabajo.iniciadoEn = iso();
    const limite = setTimeout(() => trabajo.controlador.abort(new Error('timeout')), limites.timeoutMs);
    try {
      const resultado = await renderizar(trabajo, {
        signal: trabajo.controlador.signal,
        progreso: (valor) => { trabajo.progreso = Math.max(trabajo.progreso, Math.min(100, Math.round(valor))); },
      });
      if (trabajo.controlador.signal.aborted) throw trabajo.controlador.signal.reason;
      terminar(trabajo, 'completado', { progreso: 100, resultado });
    } catch (error) {
      const motivo = trabajo.controlador.signal.reason;
      if (motivo?.message === 'timeout') terminar(trabajo, 'expirado', { error: `supero ${limites.timeoutMs} ms` });
      else if (motivo?.message === 'cancelado') terminar(trabajo, 'cancelado');
      else terminar(trabajo, 'fallido', { error: error.message });
    } finally {
      clearTimeout(limite);
      liberar();
    }
  }

  return {
    encolar(cliente, datos) {
      const delCliente = [...trabajos.values()].filter((t) => t.cliente === cliente && ACTIVOS.has(t.estado)).length;
      if (delCliente >= limites.porCliente) {
        throw crear('LIMITE_POR_CLIENTE', { maximo: limites.porCliente }, { cabeceras: { 'Retry-After': '5' } });
      }
      // la cola solo se llena con los que esperan; los que ya se estan renderizando no cuentan
      if (semaforo.enUso >= limites.simultaneos && semaforo.enEspera >= limites.enCola) {
        throw crear('COLA_LLENA', { maximo: limites.enCola }, { cabeceras: { 'Retry-After': '10' } });
      }
      const trabajo = {
        id: siguienteId,
        cliente,
        ...datos,
        estado: 'en_cola',
        progreso: 0,
        creadoEn: iso(),
        iniciadoEn: null,
        terminadoEn: null,
        resultado: null,
        error: null,
        controlador: new AbortController(),
      };
      siguienteId += 1;
      trabajos.set(trabajo.id, trabajo);
      cola.push(trabajo.id);
      ejecutar(trabajo);
      return publico(trabajo);
    },

    obtener(id) {
      const trabajo = trabajos.get(id);
      if (!trabajo) throw crear('RENDER_NO_ENCONTRADO', { renderId: id });
      return publico(trabajo);
    },

    cancelar(id, cliente) {
      const trabajo = trabajos.get(id);
      if (!trabajo || trabajo.cliente !== cliente) throw crear('RENDER_NO_ENCONTRADO', { renderId: id });
      if (!ACTIVOS.has(trabajo.estado)) throw crear('RENDER_TERMINADO', { renderId: id, estado: trabajo.estado });
      if (trabajo.estado === 'en_cola') {
        cola.splice(cola.indexOf(id), 1);
        terminar(trabajo, 'cancelado');
      }
      trabajo.controlador.abort(new Error('cancelado'));
      return publico(trabajo);
    },

    estadisticas() {
      const porEstado = {};
      for (const t of trabajos.values()) porEstado[t.estado] = (porEstado[t.estado] ?? 0) + 1;
      return {
        renderizando: semaforo.enUso, enCola: semaforo.enEspera, limites: { ...limites }, porEstado,
      };
    },
  };
}
