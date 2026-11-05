import { createHash } from 'node:crypto';

export const GENESIS = '0'.repeat(64);

// JSON con las claves ordenadas: el mismo contenido siempre produce el mismo texto y el mismo hash
export function canonico(valor) {
  if (Array.isArray(valor)) return `[${valor.map(canonico).join(',')}]`;
  if (valor !== null && typeof valor === 'object') {
    return `{${Object.keys(valor).sort().filter((k) => valor[k] !== undefined)
      .map((k) => `${JSON.stringify(k)}:${canonico(valor[k])}`).join(',')}}`;
  }
  return JSON.stringify(valor);
}

export function calcularHash(entrada) {
  const { hash, ...contenido } = entrada;
  return createHash('sha256').update(canonico(contenido)).digest('hex');
}

export function verificarCadena(entradas) {
  let anterior = GENESIS;
  for (let i = 0; i < entradas.length; i += 1) {
    const entrada = entradas[i];
    if (entrada.secuencia !== i + 1) return { integro: false, total: entradas.length, secuencia: i + 1, problema: 'falta una entrada o cambio el orden' };
    if (entrada.hashAnterior !== anterior) return { integro: false, total: entradas.length, secuencia: entrada.secuencia, problema: 'no enlaza con la entrada anterior' };
    if (calcularHash(entrada) !== entrada.hash) return { integro: false, total: entradas.length, secuencia: entrada.secuencia, problema: 'el contenido fue modificado' };
    anterior = entrada.hash;
  }
  return { integro: true, total: entradas.length, ultimoHash: anterior };
}

export function diferencias(antes, despues, prefijo = '') {
  const cambios = [];
  const claves = new Set([...Object.keys(antes ?? {}), ...Object.keys(despues ?? {})]);
  for (const clave of [...claves].sort()) {
    const a = antes?.[clave];
    const d = despues?.[clave];
    const campo = prefijo ? `${prefijo}.${clave}` : clave;
    const esObjeto = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
    if (esObjeto(a) && esObjeto(d)) cambios.push(...diferencias(a, d, campo));
    else if (canonico(a) !== canonico(d)) cambios.push({ campo, antes: a ?? null, despues: d ?? null });
  }
  return cambios;
}
