import { ACCIONES_POR_LOTE, ARMAS, TIPOS_ACCION } from '../constants/juego.js';
import {
  esObjetoPlano,
  exigirCuerpo,
  leerEntero,
  leerNumero,
  leerOpcion,
  rechazarSobrantes,
  terminar,
} from './comunes.js';

const ID = { min: 1 };

const LECTORES = {
  unirse: (origen, errores, prefijo) => ({
    jugadorId: leerEntero(origen, 'jugadorId', errores, { ...ID, prefijo }),
  }),
  salir: (origen, errores, prefijo) => ({
    jugadorId: leerEntero(origen, 'jugadorId', errores, { ...ID, prefijo }),
  }),
  mover: (origen, errores, prefijo) => ({
    jugadorId: leerEntero(origen, 'jugadorId', errores, { ...ID, prefijo }),
    x: leerNumero(origen, 'x', errores, { prefijo }),
    y: leerNumero(origen, 'y', errores, { prefijo }),
  }),
  recoger: (origen, errores, prefijo) => ({
    jugadorId: leerEntero(origen, 'jugadorId', errores, { ...ID, prefijo }),
    objetoId: leerEntero(origen, 'objetoId', errores, { ...ID, prefijo }),
  }),
  disparar: (origen, errores, prefijo) => ({
    atacanteId: leerEntero(origen, 'atacanteId', errores, { ...ID, prefijo }),
    objetivoId: leerEntero(origen, 'objetivoId', errores, { ...ID, prefijo }),
    arma: leerOpcion(origen, 'arma', Object.keys(ARMAS), errores, { requerido: false, prefijo }),
  }),
  curar: (origen, errores, prefijo) => ({
    jugadorId: leerEntero(origen, 'jugadorId', errores, { ...ID, prefijo }),
  }),
};

const CAMPOS = {
  unirse: ['jugadorId'],
  salir: ['jugadorId'],
  mover: ['jugadorId', 'x', 'y'],
  recoger: ['jugadorId', 'objetoId'],
  disparar: ['atacanteId', 'objetivoId', 'arma'],
  curar: ['jugadorId'],
};

export function validarAccion(tipo, cuerpo) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, CAMPOS[tipo], errores);
  const datos = LECTORES[tipo](cuerpo, errores, '');
  return terminar(errores, datos);
}

export function validarLote(cuerpo) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['acciones', 'detenerEnError'], errores);

  const crudas = cuerpo.acciones;
  const acciones = [];
  if (!Array.isArray(crudas)) {
    errores.push({ campo: 'acciones', mensaje: 'debe ser una lista' });
  } else if (crudas.length === 0 || crudas.length > ACCIONES_POR_LOTE) {
    errores.push({ campo: 'acciones', mensaje: `debe tener entre 1 y ${ACCIONES_POR_LOTE} acciones` });
  } else {
    crudas.forEach((cruda, i) => {
      const prefijo = `acciones[${i}]`;
      if (!esObjetoPlano(cruda)) {
        errores.push({ campo: prefijo, mensaje: 'debe ser un objeto' });
        return;
      }
      const tipo = leerOpcion(cruda, 'tipo', TIPOS_ACCION, errores, { prefijo });
      if (!tipo) return;
      rechazarSobrantes(cruda, ['tipo', ...CAMPOS[tipo]], errores, prefijo);
      acciones.push({ tipo, ...LECTORES[tipo](cruda, errores, prefijo) });
    });
  }

  let detenerEnError = false;
  if (cuerpo.detenerEnError !== undefined) {
    if (typeof cuerpo.detenerEnError === 'boolean') detenerEnError = cuerpo.detenerEnError;
    else errores.push({ campo: 'detenerEnError', mensaje: 'debe ser booleano' });
  }
  return terminar(errores, { acciones, detenerEnError });
}
