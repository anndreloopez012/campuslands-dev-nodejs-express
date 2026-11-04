import { obtener } from './hiperdeportivos.service.js';
import { enviarEvento } from './telemetria.service.js';
import { logger } from '../utils/logger.js';

const vueltas = [];

export function listarPorAuto(autoId) {
  obtener(autoId);
  return vueltas.filter((v) => v.autoId === autoId);
}

export function registrar(autoId, { circuito, tiempoSegundos }) {
  const auto = obtener(autoId);
  const mejorPrevio = Math.min(
    Infinity,
    ...vueltas.filter((v) => v.circuito === circuito).map((v) => v.tiempoSegundos)
  );

  const vuelta = {
    id: vueltas.length + 1,
    autoId,
    circuito,
    tiempoSegundos,
    esRecord: tiempoSegundos < mejorPrevio,
    fecha: new Date().toISOString(),
  };
  vueltas.push(vuelta);

  logger.info(`Vuelta registrada para ${auto.marca} ${auto.modelo} en ${circuito}: ${tiempoSegundos}s`);
  const telemetria = enviarEvento('vuelta_registrada', { autoId, circuito, tiempoSegundos });

  return { vuelta, telemetria };
}
