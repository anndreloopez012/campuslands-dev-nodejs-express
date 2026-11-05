const esperar = (ms, signal) => new Promise((resolver, rechazar) => {
  const t = setTimeout(resolver, ms);
  signal.addEventListener('abort', () => {
    clearTimeout(t);
    rechazar(signal.reason);
  }, { once: true });
});

// render simulado: cada frame "tarda" segun la calidad y respeta la cancelacion
export function crearRenderizadorSimulado({ msPorFrame = { borrador: 5, final: 20 } } = {}) {
  return async (trabajo, { signal, progreso }) => {
    for (let frame = 1; frame <= trabajo.frames; frame += 1) {
      await esperar(msPorFrame[trabajo.calidad], signal);
      progreso((frame / trabajo.frames) * 100);
    }
    return {
      archivo: `escena-${trabajo.escenaId}-v${trabajo.version}-${trabajo.calidad}.mp4`,
      frames: trabajo.frames,
    };
  };
}
