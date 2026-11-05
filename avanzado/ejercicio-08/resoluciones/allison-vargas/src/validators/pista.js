import { LISTA_CON_COMODIN, LISTA_DE_EVENTOS, TIEMPO_MAXIMO_MS, TIEMPO_MINIMO_MS } from '../constants/eventos.js';
import {
  exigirCuerpo,
  leerEntero,
  leerOpcion,
  leerPaginacion,
  leerTexto,
  rechazarSobrantes,
  terminar,
} from './comunes.js';

const enteroDeConsulta = (consulta, campo, errores, { min = 0, max = 999999999 } = {}) => {
  const crudo = consulta[campo];
  if (crudo === undefined) return undefined;
  if (typeof crudo !== 'string' || !/^\d{1,9}$/.test(crudo) || Number(crudo) < min || Number(crudo) > max) {
    errores.push({ campo, mensaje: `debe ser un entero entre ${min} y ${max}` });
    return undefined;
  }
  return Number(crudo);
};

export function validarSesionNueva(cuerpo, { circuitos, autos }) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['piloto', 'auto', 'circuitoId'], errores);
  const piloto = leerTexto(cuerpo, 'piloto', errores, { min: 3, max: 50 });
  const auto = leerOpcion(cuerpo, 'auto', autos.map((a) => a.id), errores);
  const circuitoId = leerOpcion(cuerpo, 'circuitoId', circuitos.map((c) => c.id), errores);
  return terminar(errores, { piloto, auto, circuitoId });
}

export function validarVuelta(cuerpo) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['tiempoMs', 'tempMotor', 'desgaste'], errores);
  const tiempoMs = leerEntero(cuerpo, 'tiempoMs', errores, { min: TIEMPO_MINIMO_MS, max: TIEMPO_MAXIMO_MS });
  const tempMotor = leerEntero(cuerpo, 'tempMotor', errores, { min: 40, max: 200 });
  const desgaste = leerEntero(cuerpo, 'desgaste', errores, { min: 0, max: 100 });
  return terminar(errores, { tiempoMs, tempMotor, desgaste });
}

export function validarMotivo(cuerpo) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['motivo'], errores);
  const datos = {};
  if (cuerpo.motivo !== undefined) datos.motivo = leerTexto(cuerpo, 'motivo', errores, { min: 3, max: 100 });
  return terminar(errores, datos);
}

export function consultaSesiones(consulta, { circuitos }) {
  const errores = [];
  const estado = leerOpcion(consulta, 'estado', ['en_pista', 'finalizada', 'abortada'], errores, { requerido: false });
  const circuito = enteroDeConsulta(consulta, 'circuitoId', errores, { min: 1 });
  if (circuito !== undefined && !circuitos.some((c) => c.id === circuito)) {
    errores.push({ campo: 'circuitoId', mensaje: 'no existe ese circuito' });
  }
  const paginacion = leerPaginacion(consulta, errores);
  return terminar(errores, { estado, circuitoId: circuito, ...paginacion });
}

export function consultaEventos(consulta) {
  const errores = [];
  const evento = leerOpcion(consulta, 'evento', LISTA_DE_EVENTOS, errores, { requerido: false });
  const sesionId = enteroDeConsulta(consulta, 'sesionId', errores, { min: 1 });
  const desde = enteroDeConsulta(consulta, 'desde', errores);
  const limite = enteroDeConsulta(consulta, 'limite', errores, { min: 1, max: 100 });
  return terminar(errores, { evento, sesionId, desde, limite });
}

export function consultaStream(consulta, ultimoId) {
  const errores = [];
  let eventos;
  if (consulta.eventos !== undefined) {
    const lista = typeof consulta.eventos === 'string' ? consulta.eventos.split(',') : [];
    const malos = lista.filter((e) => !LISTA_DE_EVENTOS.includes(e));
    if (lista.length === 0 || malos.length > 0) {
      errores.push({ campo: 'eventos', mensaje: `debe ser una lista separada por comas de: ${LISTA_DE_EVENTOS.join(', ')}` });
    } else {
      eventos = lista;
    }
  }
  let desde = enteroDeConsulta(consulta, 'desde', errores);
  if (desde === undefined && ultimoId !== undefined) {
    if (/^\d{1,9}$/.test(ultimoId)) desde = Number(ultimoId);
    else errores.push({ campo: 'Last-Event-ID', mensaje: 'debe ser un entero' });
  }
  return terminar(errores, { eventos, desde });
}

export function validarBuzon(cuerpo) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['nombre', 'eventos', 'capacidad', 'unaVez', 'alPrincipio', 'simularFallo'], errores);
  const nombre = leerTexto(cuerpo, 'nombre', errores, {
    min: 3,
    max: 40,
    patron: /^[A-Za-z0-9 _.-]+$/,
    mensajePatron: 'solo admite letras, numeros, espacios y . _ -',
  });
  const datos = { nombre };
  if (!Array.isArray(cuerpo.eventos)) {
    errores.push({ campo: 'eventos', mensaje: cuerpo.eventos === undefined ? 'es obligatorio' : 'debe ser una lista' });
  } else if (cuerpo.eventos.length < 1 || cuerpo.eventos.length > 8) {
    errores.push({ campo: 'eventos', mensaje: 'debe tener entre 1 y 8 eventos' });
  } else {
    cuerpo.eventos.forEach((evento, i) => {
      if (!LISTA_CON_COMODIN.includes(evento)) {
        errores.push({ campo: `eventos[${i}]`, mensaje: `debe ser uno de: ${LISTA_CON_COMODIN.join(', ')}` });
      }
    });
    if (new Set(cuerpo.eventos).size !== cuerpo.eventos.length) errores.push({ campo: 'eventos', mensaje: 'no puede repetir eventos' });
    datos.eventos = cuerpo.eventos;
  }
  const capacidad = leerEntero(cuerpo, 'capacidad', errores, { min: 1, max: 200, requerido: false });
  if (capacidad !== undefined) datos.capacidad = capacidad;
  for (const campo of ['unaVez', 'alPrincipio', 'simularFallo']) {
    if (cuerpo[campo] === undefined) continue;
    if (typeof cuerpo[campo] === 'boolean') datos[campo] = cuerpo[campo];
    else errores.push({ campo, mensaje: 'debe ser booleano' });
  }
  return terminar(errores, datos);
}
