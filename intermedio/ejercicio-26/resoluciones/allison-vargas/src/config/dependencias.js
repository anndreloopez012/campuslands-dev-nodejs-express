import { crearAnticheatHttp } from '../adapters/anticheat.http.js';
import { crearAnticheatSimulado } from '../adapters/anticheat.simulado.js';
import { crearDestinoMemoria, crearDestinoWebhook, crearNotificador } from '../adapters/notificador.js';

export function crearDependencias(config) {
  const bitacora = crearDestinoMemoria();
  const destinos = [bitacora];
  if (config.webhookUrl) destinos.push(crearDestinoWebhook({ url: config.webhookUrl }));

  const anticheat = config.anticheatUrl
    ? crearAnticheatHttp({ url: config.anticheatUrl, timeoutMs: config.anticheatTimeoutMs })
    : crearAnticheatSimulado();

  return { anticheat, notificador: crearNotificador({ destinos }), bitacora };
}
