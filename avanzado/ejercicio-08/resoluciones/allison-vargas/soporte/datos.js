export const AHORA = new Date('2026-11-05T14:00:00.000Z');

export function crearReloj(inicio = AHORA) {
  let actual = inicio.getTime();
  return {
    reloj: () => new Date(actual),
    avanzar: (ms) => {
      actual += ms;
    },
  };
}

export const pausa = () => new Promise((resolver) => setImmediate(resolver));

export async function esperarHasta(condicion, { intentos = 200 } = {}) {
  for (let i = 0; i < intentos; i += 1) {
    if (condicion()) return;
    await new Promise((resolver) => setTimeout(resolver, 5));
  }
  throw new Error('la condicion no se cumplio a tiempo');
}
