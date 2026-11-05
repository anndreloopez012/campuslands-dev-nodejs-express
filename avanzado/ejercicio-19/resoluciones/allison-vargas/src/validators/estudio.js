import { RESULTADOS } from '../auditoria/registro.js';
import {
  exigirCuerpo, leerEntero, leerOpcion, leerTexto, rechazarSobrantes, terminar,
} from './comunes.js';

function leerFechaFutura(cuerpo, errores, ahora, requerido = true) {
  if (cuerpo.fecha === undefined && !requerido) return undefined;
  const texto = leerTexto(cuerpo, 'fecha', errores, { max: 30 });
  if (texto === undefined) return undefined;
  const ms = Date.parse(texto);
  if (Number.isNaN(ms)) errores.push({ campo: 'fecha', mensaje: 'debe ser una fecha ISO' });
  else if (ms <= ahora.getTime()) errores.push({ campo: 'fecha', mensaje: 'debe ser futura' });
  else return new Date(ms).toISOString();
  return undefined;
}

export function validarCita(cuerpo, ahora) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['clienteId', 'tatuadorId', 'fecha', 'zona', 'precio', 'deposito'], errores);
  const datos = {
    clienteId: leerEntero(cuerpo, 'clienteId', errores, { min: 1 }),
    tatuadorId: leerEntero(cuerpo, 'tatuadorId', errores, { min: 1 }),
    fecha: leerFechaFutura(cuerpo, errores, ahora),
    zona: leerTexto(cuerpo, 'zona', errores, { min: 3, max: 40 }),
    precio: leerEntero(cuerpo, 'precio', errores, { min: 10000, max: 5000000 }),
    deposito: leerEntero(cuerpo, 'deposito', errores, { min: 0, requerido: false, defecto: 0 }),
  };
  if (datos.precio !== undefined && datos.deposito > datos.precio) errores.push({ campo: 'deposito', mensaje: 'no puede superar el precio' });
  return terminar(errores, datos);
}

export function validarCambioCita(cuerpo, ahora) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['fecha', 'zona', 'precio'], errores);
  if (!Object.keys(cuerpo).length) errores.push({ campo: 'cuerpo', mensaje: 'envia al menos un campo' });
  const datos = {};
  if (cuerpo.fecha !== undefined) datos.fecha = leerFechaFutura(cuerpo, errores, ahora, false);
  if (cuerpo.zona !== undefined) datos.zona = leerTexto(cuerpo, 'zona', errores, { min: 3, max: 40 });
  if (cuerpo.precio !== undefined) datos.precio = leerEntero(cuerpo, 'precio', errores, { min: 10000, max: 5000000 });
  return terminar(errores, datos);
}

export function validarMotivo(cuerpo) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['motivo'], errores);
  return terminar(errores, { motivo: leerTexto(cuerpo, 'motivo', errores, { min: 5, max: 200 }) });
}

export function validarConsentimiento(cuerpo) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['firmado', 'alergiasDeclaradas'], errores);
  if (cuerpo.firmado !== true) errores.push({ campo: 'firmado', mensaje: 'debe ser true' });
  const alergias = cuerpo.alergiasDeclaradas;
  if (!Array.isArray(alergias) || alergias.length > 10 || alergias.some((a) => typeof a !== 'string' || !/^[a-z ]{3,30}$/.test(a.trim().toLowerCase()))) {
    errores.push({ campo: 'alergiasDeclaradas', mensaje: 'debe ser una lista de hasta 10 textos' });
  }
  return terminar(errores, { alergias: [...new Set((alergias ?? []).map((a) => String(a).trim().toLowerCase()))].sort() });
}

export function leerFiltrosAuditoria(consulta) {
  const errores = [];
  rechazarSobrantes(consulta, ['actorId', 'accion', 'recursoTipo', 'recursoId', 'resultado', 'desde', 'hasta', 'despuesDe', 'limite'], errores);
  const entero = (campo, min, max) => {
    if (consulta[campo] === undefined) return undefined;
    if (!/^\d{1,9}$/.test(consulta[campo]) || Number(consulta[campo]) < min || Number(consulta[campo]) > max) {
      errores.push({ campo, mensaje: `debe ser un entero entre ${min} y ${max}` });
      return undefined;
    }
    return Number(consulta[campo]);
  };
  const filtros = {
    actorId: entero('actorId', 1, 1e9),
    recursoId: entero('recursoId', 1, 1e9),
    despuesDe: entero('despuesDe', 0, 1e9) ?? 0,
    limite: entero('limite', 1, 200) ?? 50,
    resultado: leerOpcion(consulta, 'resultado', RESULTADOS, errores, { requerido: false }),
  };
  for (const campo of ['accion', 'recursoTipo']) {
    if (consulta[campo] === undefined) continue;
    if (!/^[a-z_.]{3,40}$/.test(consulta[campo])) errores.push({ campo, mensaje: 'formato invalido' });
    else filtros[campo] = consulta[campo];
  }
  for (const campo of ['desde', 'hasta']) {
    if (consulta[campo] === undefined) continue;
    const ms = Date.parse(consulta[campo]);
    if (Number.isNaN(ms)) errores.push({ campo, mensaje: 'debe ser una fecha ISO' });
    else filtros[campo] = new Date(ms).toISOString();
  }
  return terminar(errores, filtros);
}
