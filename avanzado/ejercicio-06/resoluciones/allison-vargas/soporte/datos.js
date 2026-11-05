export const AHORA = new Date('2026-11-04T12:00:00.000Z');
export const SEG = 1000;
export const MIN = 60 * SEG;

export function crearReloj(inicio = AHORA) {
  let actual = inicio.getTime();
  return {
    reloj: () => new Date(actual),
    avanzar: (ms) => {
      actual += ms;
    },
  };
}

export function crearGeneradorDeTokens() {
  let n = 0;
  return () => {
    n += 1;
    return `tok-${n}`;
  };
}
