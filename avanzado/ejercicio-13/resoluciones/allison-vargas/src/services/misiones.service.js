import { crear } from '../errores/index.js';
import { validarFinal, validarMision, validarTelemetria } from '../validators/mision.js';

const COMBUSTIBLE_CRITICO = 15;

export function crearServicioMisiones({ naves, reloj }) {
  const misiones = new Map();
  let siguienteId = 1;

  function nave(id) {
    const encontrada = naves.find((n) => n.id === id);
    if (!encontrada) throw crear('NAVE_NO_ENCONTRADA', { naveId: id });
    return encontrada;
  }

  function mision(id) {
    const encontrada = misiones.get(id);
    if (!encontrada) throw crear('MISION_NO_ENCONTRADA', { misionId: id });
    return encontrada;
  }

  function exigirEstado(actual, esperado, destino) {
    if (actual.estado !== esperado) {
      throw crear('TRANSICION_INVALIDA', { misionId: actual.id, estado: actual.estado, destino });
    }
  }

  return {
    listarNaves: () => naves.map((n) => ({ ...n })),

    obtenerNave: (id) => ({ ...nave(id) }),

    listarMisiones: ({ estado } = {}) => [...misiones.values()]
      .filter((m) => !estado || m.estado === estado)
      .map((m) => ({ ...m })),

    obtenerMision: (id) => ({ ...mision(id) }),

    crearMision(cuerpo, log) {
      const datos = validarMision(cuerpo);
      const elegida = nave(datos.naveId);
      if (elegida.estado !== 'operativa') {
        log.warn('mision.rechazada', { naveId: elegida.id, motivo: elegida.estado });
        throw crear('NAVE_NO_DISPONIBLE', { naveId: elegida.id, estado: elegida.estado });
      }
      const nueva = {
        id: siguienteId,
        ...datos,
        estado: 'planificada',
        creadaEn: reloj().toISOString(),
        lanzadaEn: null,
        finalizadaEn: null,
        resultado: null,
        notas: null,
      };
      siguienteId += 1;
      misiones.set(nueva.id, nueva);
      log.info('mision.creada', { misionId: nueva.id, naveId: nueva.naveId, prioridad: nueva.prioridad });
      return { ...nueva };
    },

    lanzar(id, log) {
      const actual = mision(id);
      exigirEstado(actual, 'planificada', 'en_curso');
      const enCurso = [...misiones.values()].find((m) => m.naveId === actual.naveId && m.estado === 'en_curso');
      if (enCurso) {
        log.warn('mision.nave_ocupada', { misionId: id, naveId: actual.naveId, ocupadaPor: enCurso.id });
        throw crear('NAVE_OCUPADA', { naveId: actual.naveId, misionId: enCurso.id });
      }
      actual.estado = 'en_curso';
      actual.lanzadaEn = reloj().toISOString();
      log.info('mision.lanzada', { misionId: id, naveId: actual.naveId, destino: actual.destino });
      return { ...actual };
    },

    finalizar(id, cuerpo, log) {
      const datos = validarFinal(cuerpo);
      const actual = mision(id);
      exigirEstado(actual, 'en_curso', datos.resultado === 'exito' ? 'completada' : 'fallida');
      actual.estado = datos.resultado === 'exito' ? 'completada' : 'fallida';
      actual.resultado = datos.resultado;
      actual.notas = datos.notas ?? null;
      actual.finalizadaEn = reloj().toISOString();
      const duracionMs = Date.parse(actual.finalizadaEn) - Date.parse(actual.lanzadaEn);
      const evento = { misionId: id, naveId: actual.naveId, duracionMs };
      if (actual.estado === 'fallida') log.warn('mision.fallida', evento);
      else log.info('mision.completada', evento);
      return { ...actual };
    },

    telemetria(naveId, cuerpo, log) {
      const lectura = validarTelemetria(cuerpo);
      nave(naveId);
      log.debug('telemetria.recibida', { naveId, ...lectura });
      const alertas = [];
      if (lectura.combustible < COMBUSTIBLE_CRITICO) {
        alertas.push('combustible_bajo');
        log.warn('telemetria.combustible_bajo', { naveId, combustible: lectura.combustible });
      }
      return { naveId, recibidaEn: reloj().toISOString(), lectura, alertas };
    },
  };
}
