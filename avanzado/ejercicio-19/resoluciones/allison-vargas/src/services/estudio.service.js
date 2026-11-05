import { crear } from '../errores/index.js';
import {
  validarCambioCita, validarCita, validarConsentimiento, validarMotivo,
} from '../validators/estudio.js';

const REGLAS = {
  'cita.crear': (a) => ['recepcion', 'admin'].includes(a.rol),
  'cita.editar': (a) => ['recepcion', 'admin'].includes(a.rol),
  'cita.cancelar': (a) => ['recepcion', 'admin'].includes(a.rol),
  'cita.realizar': (a, cita) => a.rol === 'tatuador' && cita.tatuadorId === a.id,
  'consentimiento.firmar': (a, cita) => a.rol === 'recepcion' || (a.rol === 'tatuador' && cita.tatuadorId === a.id),
  'cliente.ver': (a, cliente, ctx) => a.rol !== 'tatuador' || ctx.esSuCliente,
  'auditoria.ver': (a) => a.rol === 'admin',
};

// quien puede leer datos de salud: el admin y el tatuador que atiende al cliente
const veDatosSensibles = (actor, ctx) => actor.rol === 'admin' || (actor.rol === 'tatuador' && ctx.esSuCliente);

export function crearServicioEstudio({
  personal, clientes: baseClientes, auditoria, reloj,
}) {
  const clientes = new Map(structuredClone(baseClientes).map((c) => [c.id, c]));
  const citas = new Map();
  let siguienteCita = 1;

  function permitir(actor, accion, recurso, contexto, extra = {}) {
    if (REGLAS[accion](actor, recurso, extra)) return;
    auditoria.registrar({
      actor, accion, recurso: { tipo: accion.split('.')[0], id: recurso?.id ?? null }, resultado: 'denegado', motivo: `rol ${actor.rol}`, contexto,
    });
    throw crear('PROHIBIDO', { accion });
  }

  function cliente(id) {
    const encontrado = clientes.get(id);
    if (!encontrado) throw crear('CLIENTE_NO_ENCONTRADO', { clienteId: id });
    return encontrado;
  }

  function cita(id) {
    const encontrada = citas.get(id);
    if (!encontrada) throw crear('CITA_NO_ENCONTRADA', { citaId: id });
    return encontrada;
  }

  // patron "auditar y despues aplicar": si la auditoria falla, el cambio nunca se guarda
  function aplicar({
    actor, accion, antes, despues, guardar, contexto, motivo,
  }) {
    auditoria.registrar({
      actor, accion, recurso: { tipo: accion.split('.')[0], id: despues.id }, antes, despues, motivo, contexto,
    });
    guardar(despues);
    return structuredClone(despues);
  }

  const exigirEstado = (actual, permitidos, accion) => {
    if (!permitidos.includes(actual.estado)) throw crear('ESTADO_INVALIDO', { estado: actual.estado, accion });
  };

  return {
    actor(cabecera) {
      const id = /^\d{1,6}$/.test(cabecera ?? '') ? Number(cabecera) : null;
      const encontrado = personal.find((p) => p.id === id);
      if (!encontrado) throw crear('NO_AUTENTICADO');
      return encontrado;
    },

    verCliente(actor, id, contexto) {
      const elegido = cliente(id);
      const esSuCliente = [...citas.values()].some((c) => c.clienteId === id && c.tatuadorId === actor.id);
      permitir(actor, 'cliente.ver', elegido, contexto, { esSuCliente });
      if (!veDatosSensibles(actor, { esSuCliente })) {
        const { alergias, ...resto } = elegido;
        return resto;
      }
      // leer datos de salud tambien queda registrado, aunque no cambie nada
      auditoria.registrar({
        actor, accion: 'cliente.ver_sensible', recurso: { tipo: 'cliente', id }, contexto,
      });
      return structuredClone(elegido);
    },

    listarCitas: (actor) => [...citas.values()].filter((c) => actor.rol !== 'tatuador' || c.tatuadorId === actor.id),

    crearCita(actor, cuerpo, contexto) {
      permitir(actor, 'cita.crear', null, contexto);
      const datos = validarCita(cuerpo, reloj());
      cliente(datos.clienteId);
      if (!personal.some((p) => p.id === datos.tatuadorId && p.rol === 'tatuador')) {
        throw crear('VALIDACION', {}, { detalles: [{ campo: 'tatuadorId', mensaje: 'debe ser un tatuador del estudio' }] });
      }
      const nueva = {
        id: siguienteCita, ...datos, estado: 'agendada', consentimiento: null, creadaEn: reloj().toISOString(),
      };
      const guardada = aplicar({
        actor, accion: 'cita.crear', antes: null, despues: nueva, contexto, guardar: (c) => citas.set(c.id, c),
      });
      siguienteCita += 1;
      return guardada;
    },

    editarCita(actor, id, cuerpo, contexto) {
      const actual = cita(id);
      permitir(actor, 'cita.editar', actual, contexto);
      exigirEstado(actual, ['agendada', 'confirmada'], 'editar');
      const despues = { ...structuredClone(actual), ...validarCambioCita(cuerpo, reloj()) };
      return aplicar({
        actor, accion: 'cita.editar', antes: actual, despues, contexto, guardar: (c) => citas.set(id, c),
      });
    },

    cancelarCita(actor, id, cuerpo, contexto) {
      const actual = cita(id);
      permitir(actor, 'cita.cancelar', actual, contexto);
      const { motivo } = validarMotivo(cuerpo);
      exigirEstado(actual, ['agendada', 'confirmada'], 'cancelar');
      return aplicar({
        actor, accion: 'cita.cancelar', antes: actual, despues: { ...structuredClone(actual), estado: 'cancelada' }, motivo, contexto, guardar: (c) => citas.set(id, c),
      });
    },

    firmarConsentimiento(actor, id, cuerpo, contexto) {
      const actual = cita(id);
      permitir(actor, 'consentimiento.firmar', actual, contexto);
      exigirEstado(actual, ['agendada'], 'firmar el consentimiento');
      const { alergias } = validarConsentimiento(cuerpo);
      const clienteAntes = cliente(actual.clienteId);
      const despues = {
        ...structuredClone(actual), estado: 'confirmada', consentimiento: { firmadoEn: reloj().toISOString(), recibidoPor: actor.id },
      };
      const clienteDespues = { ...structuredClone(clienteAntes), alergias };
      // cambia la cita y el cliente: una sola entrada de auditoria cubre ambos para que sea todo o nada
      auditoria.registrar({
        actor,
        accion: 'cita.consentimiento',
        recurso: { tipo: 'cita', id },
        antes: { cita: actual, cliente: clienteAntes },
        despues: { cita: despues, cliente: clienteDespues },
        contexto,
      });
      clientes.set(clienteDespues.id, clienteDespues);
      citas.set(id, despues);
      return structuredClone(despues);
    },

    realizarCita(actor, id, contexto) {
      const actual = cita(id);
      permitir(actor, 'cita.realizar', actual, contexto);
      if (actual.estado === 'agendada') throw crear('SIN_CONSENTIMIENTO');
      exigirEstado(actual, ['confirmada'], 'realizar');
      return aplicar({
        actor, accion: 'cita.realizar', antes: actual, despues: { ...structuredClone(actual), estado: 'realizada' }, contexto, guardar: (c) => citas.set(id, c),
      });
    },

    historial(actor, id, contexto) {
      permitir(actor, 'auditoria.ver', null, contexto);
      cita(id);
      return auditoria.consultar({ recursoTipo: 'cita', recursoId: id, limite: 200 }).data;
    },

    exigirAuditor: (actor, contexto) => permitir(actor, 'auditoria.ver', null, contexto),
  };
}
