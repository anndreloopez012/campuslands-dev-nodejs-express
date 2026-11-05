// renderizador controlado por la prueba: cada trabajo espera a que la prueba lo complete o lo haga fallar
export function crearRenderizadorManual() {
  const enCurso = new Map();
  const renderizar = (trabajo, { signal, progreso }) => new Promise((resolver, rechazar) => {
    enCurso.set(trabajo.id, {
      completar: () => resolver({ archivo: `render-${trabajo.id}.mp4` }),
      fallar: (mensaje) => rechazar(new Error(mensaje)),
      progreso,
    });
    signal.addEventListener('abort', () => rechazar(signal.reason), { once: true });
  });
  return {
    renderizar,
    enCurso,
    control: (id) => enCurso.get(id),
  };
}

export const tick = () => new Promise((r) => { setImmediate(r); });

export async function esperarHasta(condicion, intentos = 200) {
  for (let i = 0; i < intentos; i += 1) {
    if (await condicion()) return;
    await new Promise((r) => { setTimeout(r, 5); });
  }
  throw new Error('la condicion nunca se cumplio');
}
