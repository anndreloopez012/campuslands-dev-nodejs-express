// Servicio puro e independiente del framework web
export const STORM_PHASES = [
  { fase: 1, danoPorSegundo: 1, radioMetros: 2000, tiempoCierreSegundos: 180 },
  { fase: 2, danoPorSegundo: 2, radioMetros: 1400, tiempoCierreSegundos: 150 },
  { fase: 3, danoPorSegundo: 4, radioMetros: 900, tiempoCierreSegundos: 120 },
  { fase: 4, danoPorSegundo: 7, radioMetros: 500, tiempoCierreSegundos: 90 },
  { fase: 5, danoPorSegundo: 10, radioMetros: 200, tiempoCierreSegundos: 60 },
  { fase: 6, danoPorSegundo: 15, radioMetros: 50, tiempoCierreSegundos: 30 }
];

export function getStormPhases() {
  return STORM_PHASES;
}

export function calculateSurvival(fase, tiempoSegundos, hpActual) {
  if (fase < 1 || fase > 6) {
    const error = new Error(`La fase de la tormenta debe estar entre 1 y 6.`);
    error.statusCode = 400;
    throw error;
  }

  if (tiempoSegundos < 0 || hpActual <= 0) {
    const error = new Error('El tiempo y los puntos de vida deben ser mayores a cero.');
    error.statusCode = 400;
    throw error;
  }

  const phaseData = STORM_PHASES.find((p) => p.fase === Number(fase));
  const danoTotal = phaseData.danoPorSegundo * tiempoSegundos;
  const hpRestante = Math.max(0, hpActual - danoTotal);
  const sobrevive = hpRestante > 0;

  return {
    fase,
    danoPorSegundo: phaseData.danoPorSegundo,
    tiempoExpuestoSegundos: tiempoSegundos,
    danoRecibido: danoTotal,
    hpInicial: hpActual,
    hpRestante,
    sobrevive,
    estado: sobrevive ? 'Superviviente' : 'Eliminado por la tormenta'
  };
}
