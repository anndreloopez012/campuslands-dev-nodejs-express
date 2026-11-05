export const AHORA = new Date('2026-11-04T12:00:00.000Z');

export function crearReloj(inicio = AHORA) {
  let actual = inicio.getTime();
  return {
    reloj: () => new Date(actual),
    avanzar: (ms) => {
      actual += ms;
    },
  };
}

export const DIA = 24 * 60 * 60 * 1000;

export function crearAzar(semilla) {
  let estado = semilla >>> 0;
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
