import { ALIAS_ENCABEZADOS, OBLIGATORIAS } from '../constants/csv.js';
import { crear } from '../errores/index.js';
import { claveDeEncabezado } from './texto.js';

const PORALIAS = new Map(
  Object.entries(ALIAS_ENCABEZADOS).flatMap(([canonica, alias]) => alias.map((a) => [a, canonica])),
);

export function analizarEncabezados(campos) {
  const indices = new Map();
  const ignoradas = [];
  const duplicadas = [];
  campos.forEach((crudo, posicion) => {
    const nombre = crudo.trim();
    if (nombre === '') return;
    const canonica = PORALIAS.get(claveDeEncabezado(nombre));
    if (!canonica) {
      ignoradas.push(nombre);
    } else if (indices.has(canonica)) {
      duplicadas.push(canonica);
    } else {
      indices.set(canonica, posicion);
    }
  });
  const faltantes = OBLIGATORIAS.filter((c) => !indices.has(c));
  const conPuntos = indices.has('puntosLocal') !== indices.has('puntosVisita');
  return { indices, ignoradas, duplicadas: [...new Set(duplicadas)], faltantes, conPuntos };
}

export function exigirEncabezados(campos) {
  const analisis = analizarEncabezados(campos);
  const detalles = [
    ...analisis.faltantes.map((c) => ({ campo: c, mensaje: 'falta la columna obligatoria' })),
    ...analisis.duplicadas.map((c) => ({ campo: c, mensaje: 'aparece en mas de una columna' })),
  ];
  if (analisis.conPuntos) {
    detalles.push({ campo: 'puntosLocal', mensaje: 'puntosLocal y puntosVisita deben venir juntas o no venir' });
  }
  if (detalles.length) throw crear('ENCABEZADOS_INVALIDOS', {}, { detalles });
  return analisis;
}
