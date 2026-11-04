import { hashear, verificar, sha256Simple } from '../utils/hash.js';
import { PARAMETROS, LIMITES } from '../constants/hash.js';

const medir = async (tarea) => {
  const inicio = process.hrtime.bigint();
  const resultado = await tarea();
  return { resultado, ms: Number(process.hrtime.bigint() - inicio) / 1e6 };
};

export const parametros = () => ({ actual: PARAMETROS, limitesAceptados: LIMITES });

export async function demo({ password }) {
  const inicioSimple = process.hrtime.bigint();
  const simple1 = sha256Simple(password);
  const simple2 = sha256Simple(password);
  const msSimple = Number(process.hrtime.bigint() - inicioSimple) / 1e6;

  const primero = await medir(() => hashear(password));
  const segundo = await medir(() => hashear(password));
  const valido1 = await verificar(password, primero.resultado);
  const valido2 = await verificar(password, segundo.resultado);

  return {
    longitudPassword: password.length,
    sinSal: {
      algoritmo: 'sha256',
      hash1: simple1,
      hash2: simple2,
      iguales: simple1 === simple2,
      duracionMs: Number(msSimple.toFixed(3)),
    },
    conSal: {
      algoritmo: 'scrypt',
      hash1: primero.resultado,
      hash2: segundo.resultado,
      iguales: primero.resultado === segundo.resultado,
      duracionMs: Number(((primero.ms + segundo.ms) / 2).toFixed(1)),
    },
    verificacion: { hash1Valido: valido1.coincide, hash2Valido: valido2.coincide },
    parametros: PARAMETROS,
  };
}

export async function comprobar({ password, hash }) {
  const { coincide, necesitaActualizar, datos } = await verificar(password, hash);
  return {
    valido: coincide,
    algoritmo: datos.algoritmo,
    necesitaActualizar,
    ...(datos.algoritmo === 'scrypt' ? { N: datos.N, r: datos.r, p: datos.p } : {}),
  };
}
