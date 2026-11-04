import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { PARAMETROS, LIMITES, MEMORIA_MAXIMA } from '../constants/hash.js';
import { ValidationError } from './errors.js';

const derivar = promisify(scrypt);

const normalizar = (password) => password.normalize('NFKC');

const dentro = (valor, { min, max }) => Number.isInteger(valor) && valor >= min && valor <= max;

const potenciaDeDos = (n) => (n & (n - 1)) === 0;

export const sha256Simple = (password) => createHash('sha256').update(normalizar(password)).digest('hex');

export async function hashear(password, parametros = PARAMETROS) {
  const { N, r, p, longitudClave, longitudSal } = parametros;
  const sal = randomBytes(longitudSal);
  const clave = await derivar(normalizar(password), sal, longitudClave, { N, r, p, maxmem: MEMORIA_MAXIMA });
  return ['scrypt', N, r, p, sal.toString('base64url'), clave.toString('base64url')].join('$');
}

export function leerHash(guardado) {
  if (typeof guardado !== 'string') return null;
  const partes = guardado.split('$');

  if (partes.length === 2 && partes[0] === 'sha256' && /^[0-9a-f]{64}$/.test(partes[1])) {
    return { algoritmo: 'sha256', clave: Buffer.from(partes[1], 'hex') };
  }

  if (partes.length !== 6 || partes[0] !== 'scrypt') return null;
  const [, N, r, p, sal, clave] = partes;
  if (![N, r, p].every((valor) => /^\d{1,6}$/.test(valor))) return null;
  if (!/^[A-Za-z0-9_-]+$/.test(sal) || !/^[A-Za-z0-9_-]+$/.test(clave)) return null;

  const salBuffer = Buffer.from(sal, 'base64url');
  const claveBuffer = Buffer.from(clave, 'base64url');
  return {
    algoritmo: 'scrypt',
    N: Number(N),
    r: Number(r),
    p: Number(p),
    sal: salBuffer,
    clave: claveBuffer,
  };
}

export function validarFormato(guardado) {
  const datos = leerHash(guardado);
  if (!datos) throw new ValidationError('El hash no tiene un formato conocido', [{ campo: 'hash', mensaje: 'formato esperado: scrypt$N$r$p$sal$clave o sha256$hex' }], 'HASH_INVALIDO');
  if (datos.algoritmo === 'scrypt') {
    const fuera = !dentro(datos.N, LIMITES.N) || !potenciaDeDos(datos.N)
      || !dentro(datos.r, LIMITES.r) || !dentro(datos.p, LIMITES.p)
      || !dentro(datos.clave.length, LIMITES.longitudClave) || !dentro(datos.sal.length, LIMITES.longitudSal);
    if (fuera) {
      throw new ValidationError('Los parametros del hash estan fuera de rango', [{ campo: 'hash', mensaje: 'N potencia de 2 entre 1024 y 65536, r 1-16, p 1-4, clave 16-64 bytes, sal 8-64 bytes' }], 'PARAMETROS_FUERA_DE_RANGO');
    }
  }
  return datos;
}

export function necesitaActualizar(datos) {
  if (datos.algoritmo !== 'scrypt') return true;
  return datos.N < PARAMETROS.N
    || datos.r < PARAMETROS.r
    || datos.p < PARAMETROS.p
    || datos.clave.length < PARAMETROS.longitudClave
    || datos.sal.length < PARAMETROS.longitudSal;
}

export async function verificar(password, guardado) {
  const datos = validarFormato(guardado);
  const texto = normalizar(password);

  let calculada;
  if (datos.algoritmo === 'sha256') {
    calculada = createHash('sha256').update(texto).digest();
  } else {
    calculada = await derivar(texto, datos.sal, datos.clave.length, {
      N: datos.N,
      r: datos.r,
      p: datos.p,
      maxmem: MEMORIA_MAXIMA,
    });
  }

  const coincide = calculada.length === datos.clave.length && timingSafeEqual(calculada, datos.clave);
  return { coincide, necesitaActualizar: necesitaActualizar(datos), datos };
}

export function resumen(guardado) {
  const datos = leerHash(guardado);
  if (!datos) return null;
  const base = { algoritmo: datos.algoritmo, actualizado: !necesitaActualizar(datos) };
  if (datos.algoritmo === 'sha256') return { ...base, conSal: false };
  return { ...base, conSal: true, N: datos.N, r: datos.r, p: datos.p, longitudSal: datos.sal.length, longitudClave: datos.clave.length };
}
