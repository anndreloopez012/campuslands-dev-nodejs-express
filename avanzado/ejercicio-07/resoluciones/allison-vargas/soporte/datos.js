export const AHORA = new Date('2026-11-05T12:00:00.000Z');
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

export function crearEsperaControlable() {
  let compuerta = null;
  const llamadas = [];
  return {
    llamadas,
    espera: async (tipo, ...args) => {
      llamadas.push([tipo, ...args]);
      if (compuerta) await compuerta.promesa;
    },
    retener() {
      let abrir;
      const promesa = new Promise((resolver) => {
        abrir = resolver;
      });
      compuerta = { promesa, abrir };
    },
    liberar() {
      compuerta?.abrir();
      compuerta = null;
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
