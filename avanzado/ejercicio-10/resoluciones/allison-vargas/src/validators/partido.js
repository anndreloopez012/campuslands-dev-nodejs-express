import {
  DELIMITADORES, FORMATOS_PARTIDO, MODOS, OPCIONES_DELIMITADOR,
} from '../constants/csv.js';
import { normalizarClave } from '../domain/texto.js';
import { leerPaginacion, rechazarSobrantes, terminar } from './comunes.js';

export function parseFecha(texto) {
  let iso = null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    iso = texto;
  } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(texto)) {
    const [dia, mes, anio] = texto.split('/');
    iso = `${anio}-${mes}-${dia}`;
  }
  if (!iso) return null;
  const fecha = new Date(`${iso}T00:00:00Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === iso ? iso : null;
}

const entero = (texto) => (/^\d{1,4}$/.test(texto) ? Number(texto) : null);
const empiezaPeligroso = (texto) => /^[=+@\t\r]/.test(texto);

function leerNombre(crudo, campo, errores) {
  const texto = (crudo ?? '').replace(/\s+/g, ' ').trim();
  if (texto === '') {
    errores.push({ campo, mensaje: 'es obligatorio' });
    return undefined;
  }
  if (texto.length < 2 || texto.length > 40) errores.push({ campo, mensaje: 'debe tener entre 2 y 40 caracteres' });
  else if (empiezaPeligroso(texto)) errores.push({ campo, mensaje: 'no puede empezar con =, + o @' });
  return texto;
}

function leerNumeroOpcional(crudo, campo, errores, { min, max }) {
  const texto = (crudo ?? '').trim();
  if (texto === '') return null;
  const valor = entero(texto);
  if (valor === null) errores.push({ campo, mensaje: 'debe ser un entero sin signo ni decimales' });
  else if (valor < min || valor > max) errores.push({ campo, mensaje: `debe estar entre ${min} y ${max}` });
  return valor;
}

export function validarFila(fila, { hoy }) {
  const errores = [];

  const fechaCruda = (fila.fecha ?? '').trim();
  let fecha = null;
  if (fechaCruda === '') errores.push({ campo: 'fecha', mensaje: 'es obligatoria' });
  else {
    fecha = parseFecha(fechaCruda);
    if (!fecha) errores.push({ campo: 'fecha', mensaje: 'debe ser una fecha real como AAAA-MM-DD o DD/MM/AAAA' });
    else if (fecha > hoy) errores.push({ campo: 'fecha', mensaje: 'no puede ser futura' });
  }

  const local = leerNombre(fila.local, 'local', errores);
  const visita = leerNombre(fila.visita, 'visita', errores);
  if (local && visita && normalizarClave(local) === normalizarClave(visita)) {
    errores.push({ campo: 'visita', mensaje: 'no puede ser el mismo jugador que local' });
  }

  let torneo = (fila.torneo ?? '').replace(/\s+/g, ' ').trim();
  if (torneo === '') torneo = 'Sin torneo';
  else if (torneo.length > 60) errores.push({ campo: 'torneo', mensaje: 'debe tener como maximo 60 caracteres' });
  else if (empiezaPeligroso(torneo)) errores.push({ campo: 'torneo', mensaje: 'no puede empezar con =, + o @' });

  const mesa = leerNumeroOpcional(fila.mesa, 'mesa', errores, { min: 1, max: 20 });

  let mejorDe = 5;
  const crudoFormato = (fila.mejorDe ?? '').trim();
  if (crudoFormato !== '') {
    mejorDe = entero(crudoFormato);
    if (!FORMATOS_PARTIDO.includes(mejorDe)) {
      errores.push({ campo: 'mejorDe', mensaje: `debe ser uno de: ${FORMATOS_PARTIDO.join(', ')}` });
      mejorDe = null;
    }
  }

  const setsLocal = entero((fila.setsLocal ?? '').trim());
  const setsVisita = entero((fila.setsVisita ?? '').trim());
  if (setsLocal === null) errores.push({ campo: 'setsLocal', mensaje: 'debe ser un entero sin signo ni decimales' });
  if (setsVisita === null) errores.push({ campo: 'setsVisita', mensaje: 'debe ser un entero sin signo ni decimales' });

  let ganador = null;
  if (mejorDe !== null && setsLocal !== null && setsVisita !== null) {
    const necesarios = (mejorDe + 1) / 2;
    const mayor = Math.max(setsLocal, setsVisita);
    const menor = Math.min(setsLocal, setsVisita);
    if (mayor !== necesarios || menor >= necesarios) {
      errores.push({ campo: 'setsLocal', mensaje: `en un mejor de ${mejorDe} el ganador debe tener exactamente ${necesarios} sets y el otro menos` });
    } else {
      ganador = setsLocal > setsVisita ? 'local' : 'visita';
    }
  }

  const puntosLocal = leerNumeroOpcional(fila.puntosLocal, 'puntosLocal', errores, { min: 0, max: 2000 });
  const puntosVisita = leerNumeroOpcional(fila.puntosVisita, 'puntosVisita', errores, { min: 0, max: 2000 });
  if ((puntosLocal === null) !== (puntosVisita === null)) {
    errores.push({ campo: 'puntosVisita', mensaje: 'los puntos de local y visita deben venir los dos o ninguno' });
  } else if (puntosLocal !== null && setsLocal !== null && setsVisita !== null) {
    if (puntosLocal < setsLocal * 11) errores.push({ campo: 'puntosLocal', mensaje: `con ${setsLocal} sets ganados debe tener al menos ${setsLocal * 11} puntos` });
    if (puntosVisita < setsVisita * 11) errores.push({ campo: 'puntosVisita', mensaje: `con ${setsVisita} sets ganados debe tener al menos ${setsVisita * 11} puntos` });
  }

  if (errores.length) return { errores };
  return {
    valor: {
      fecha, torneo, mesa, local, visita, mejorDe, setsLocal, setsVisita, puntosLocal, puntosVisita, ganador,
    },
  };
}

const crudo = (consulta, campo, errores, { max = 60 } = {}) => {
  const valor = consulta[campo];
  if (valor === undefined) return undefined;
  if (typeof valor !== 'string' || valor.trim() === '' || valor.length > max) {
    errores.push({ campo, mensaje: `debe ser texto de 1 a ${max} caracteres` });
    return undefined;
  }
  return valor.trim();
};

const opcion = (consulta, campo, opciones, errores) => {
  const valor = consulta[campo];
  if (valor === undefined) return undefined;
  if (typeof valor !== 'string' || !opciones.includes(valor)) {
    errores.push({ campo, mensaje: `debe ser uno de: ${opciones.join(', ')}` });
    return undefined;
  }
  return valor;
};

const booleano = (consulta, campo, errores) => {
  const valor = opcion(consulta, campo, ['true', 'false'], errores);
  return valor === 'true';
};

const fecha = (consulta, campo, errores) => {
  const valor = consulta[campo];
  if (valor === undefined) return undefined;
  const iso = typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valor) ? parseFecha(valor) : null;
  if (!iso) errores.push({ campo, mensaje: 'debe ser una fecha real con formato AAAA-MM-DD' });
  return iso ?? undefined;
};

export function resolverDelimitador(nombre) {
  return nombre && nombre !== 'auto' ? DELIMITADORES[nombre] : null;
}

export function leerOpcionesDeLectura(consulta, { importar }) {
  const errores = [];
  rechazarSobrantes(consulta, importar ? ['delimitador', 'modo', 'dryRun', 'nombre'] : ['delimitador'], errores);
  const delimitador = opcion(consulta, 'delimitador', OPCIONES_DELIMITADOR, errores) ?? 'auto';
  const resultado = { delimitador };
  if (importar) {
    resultado.modo = opcion(consulta, 'modo', MODOS, errores) ?? 'permisivo';
    resultado.dryRun = booleano(consulta, 'dryRun', errores);
    resultado.nombre = crudo(consulta, 'nombre', errores, { max: 80 }) ?? null;
  }
  return terminar(errores, resultado);
}

function leerFiltros(consulta, errores) {
  const desde = fecha(consulta, 'desde', errores);
  const hasta = fecha(consulta, 'hasta', errores);
  if (desde && hasta && desde > hasta) errores.push({ campo: 'hasta', mensaje: 'no puede ser anterior a desde' });
  const importacion = consulta.importacionId;
  let importacionId;
  if (importacion !== undefined) {
    if (typeof importacion === 'string' && /^[1-9]\d{0,8}$/.test(importacion)) importacionId = Number(importacion);
    else errores.push({ campo: 'importacionId', mensaje: 'debe ser un entero positivo' });
  }
  return {
    jugador: crudo(consulta, 'jugador', errores, { max: 40 }),
    torneo: crudo(consulta, 'torneo', errores),
    desde,
    hasta,
    importacionId,
  };
}

export function leerListado(consulta) {
  const errores = [];
  rechazarSobrantes(consulta, ['pagina', 'limite', 'jugador', 'torneo', 'desde', 'hasta', 'importacionId'], errores);
  const { pagina, limite } = leerPaginacion(consulta, errores);
  const filtros = leerFiltros(consulta, errores);
  return terminar(errores, { pagina, limite, filtros });
}

export function leerExportacion(consulta) {
  const errores = [];
  rechazarSobrantes(consulta, ['delimitador', 'bom', 'jugador', 'torneo', 'desde', 'hasta', 'importacionId'], errores);
  const nombre = opcion(consulta, 'delimitador', Object.keys(DELIMITADORES), errores) ?? 'coma';
  const bom = booleano(consulta, 'bom', errores);
  const filtros = leerFiltros(consulta, errores);
  return terminar(errores, { delimitador: DELIMITADORES[nombre], bom, filtros });
}

export function leerRanking(consulta) {
  const errores = [];
  rechazarSobrantes(consulta, ['torneo', 'minPartidos', 'limite'], errores);
  const torneo = crudo(consulta, 'torneo', errores);
  const numero = (campo, defecto, min, max) => {
    const valor = consulta[campo];
    if (valor === undefined) return defecto;
    if (typeof valor !== 'string' || !/^\d{1,4}$/.test(valor) || Number(valor) < min || Number(valor) > max) {
      errores.push({ campo, mensaje: `debe ser un entero entre ${min} y ${max}` });
      return defecto;
    }
    return Number(valor);
  };
  const minPartidos = numero('minPartidos', 1, 1, 1000);
  const limite = numero('limite', 10, 1, 50);
  return terminar(errores, { torneo, minPartidos, limite });
}

export function leerEnfrentamiento(consulta) {
  const errores = [];
  rechazarSobrantes(consulta, ['a', 'b'], errores);
  const a = crudo(consulta, 'a', errores, { max: 40 });
  const b = crudo(consulta, 'b', errores, { max: 40 });
  if (a === undefined && consulta.a === undefined) errores.push({ campo: 'a', mensaje: 'es obligatorio' });
  if (b === undefined && consulta.b === undefined) errores.push({ campo: 'b', mensaje: 'es obligatorio' });
  if (a && b && normalizarClave(a) === normalizarClave(b)) errores.push({ campo: 'b', mensaje: 'debe ser un jugador distinto de a' });
  return terminar(errores, { a, b });
}
