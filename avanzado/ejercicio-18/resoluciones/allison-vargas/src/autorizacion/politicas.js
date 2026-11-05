export const LICENCIAS = Object.freeze(['A', 'B', 'C', 'D']);
export const TIPOS_SALTO = Object.freeze({
  tandem: { licencia: null, descripcion: 'amarrado a un instructor' },
  aff: { licencia: null, descripcion: 'caida libre acelerada con instructores' },
  libre: { licencia: 'A', descripcion: 'salto solo' },
  wingsuit: { licencia: 'C', descripcion: 'traje de alas' },
});

export const ROLES = Object.freeze({
  alumno: { hereda: [], permisos: ['perfil:ver', 'saltos:ver', 'saltos:crear'] },
  paracaidista: { hereda: ['alumno'], permisos: ['equipos:reservar'] },
  instructor: { hereda: ['paracaidista'], permisos: ['saltos:aprobar', 'bitacora:firmar'] },
  piloto: { hereda: [], permisos: ['perfil:ver', 'vuelos:ver', 'vuelos:despegar', 'manifiesto:ver'] },
  jefe_zona: {
    hereda: ['instructor'], permisos: ['vuelos:ver', 'vuelos:crear', 'manifiesto:ver', 'saltos:ver_todos', 'clima:gestionar'],
  },
  admin: { hereda: ['jefe_zona'], permisos: ['roles:ver'] },
});

const nivel = (licencia) => (licencia ? LICENCIAS.indexOf(licencia) : -1);
const certificado = (usuario) => (usuario.certificaciones ?? []).includes('instructor');

export const CONDICIONES = Object.freeze({
  'saltos:ver': ({ usuario, recurso, tiene }) => {
    if (!recurso || tiene('saltos:ver_todos')) return null;
    if (recurso.saltadorId === usuario.id) return null;
    if (certificado(usuario) && (usuario.alumnos ?? []).includes(recurso.saltadorId)) return null;
    return 'solo puedes ver tus saltos o los de tus alumnos';
  },

  'saltos:crear': ({ usuario, recurso }) => {
    const requisito = TIPOS_SALTO[recurso.tipo]?.licencia;
    if (requisito && nivel(usuario.licencia) < nivel(requisito)) {
      return `un salto ${recurso.tipo} exige licencia ${requisito} o superior`;
    }
    if (!requisito && usuario.licencia && recurso.tipo === 'aff') return 'con licencia ya no corresponde un salto aff';
    return null;
  },

  'saltos:aprobar': ({ usuario, recurso, contexto }) => {
    if (!certificado(usuario)) return 'aprobar saltos exige la certificacion de instructor';
    // separacion de funciones: quien salta no puede aprobarse a si mismo
    if (recurso.saltadorId === usuario.id) return 'nadie puede aprobar su propio salto';
    const saltador = contexto.saltador;
    if (!saltador.licencia && !(usuario.alumnos ?? []).includes(saltador.id)) {
      return 'los saltos de un alumno solo los aprueba su instructor asignado';
    }
    return null;
  },

  'bitacora:firmar': ({ usuario }) => (certificado(usuario) ? null : 'firmar bitacoras exige la certificacion de instructor'),

  'vuelos:despegar': ({ usuario, recurso }) => (recurso.pilotoId === usuario.id ? null : 'solo el piloto asignado puede despegar'),

  'manifiesto:ver': ({ usuario, recurso, tiene }) => {
    if (tiene('vuelos:crear') || recurso.pilotoId === usuario.id) return null;
    return 'el manifiesto solo lo ven el piloto asignado y la jefatura';
  },
});

export const PROHIBICIONES = Object.freeze([
  {
    acciones: ['saltos:crear', 'saltos:aprobar', 'vuelos:despegar'],
    motivo: 'los saltos estan suspendidos por clima',
    aplica: (usuario, recurso, contexto) => Boolean(contexto.clima?.suspendido),
  },
  {
    acciones: ['saltos:crear', 'vuelos:despegar', 'saltos:aprobar'],
    motivo: 'tu cuenta esta suspendida',
    aplica: (usuario) => usuario.suspendido === true,
  },
]);
