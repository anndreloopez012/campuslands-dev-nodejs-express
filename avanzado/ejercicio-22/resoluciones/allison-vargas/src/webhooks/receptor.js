import { verificarFirma } from './firma.js';

// simula el sistema de un cliente que recibe los webhooks: verifica, descarta duplicados y procesa
export function crearReceptor({ reloj }) {
  const recibidos = [];
  const vistos = new Set();
  const rechazos = [];
  const config = { secretos: [], fallarProximos: 0, responderGone: false };

  return {
    configurar({ secretos, fallarProximos, responderGone }) {
      if (secretos) config.secretos = secretos;
      if (fallarProximos !== undefined) config.fallarProximos = fallarProximos;
      if (responderGone !== undefined) config.responderGone = responderGone;
      return { secretos: config.secretos.length, fallarProximos: config.fallarProximos, responderGone: config.responderGone };
    },

    recibir({ cuerpoCrudo, cabeceras }) {
      if (config.responderGone) return { status: 410 };
      if (config.fallarProximos > 0) {
        config.fallarProximos -= 1;
        return { status: 503 };
      }
      const resultado = verificarFirma(cabeceras['x-firma'], cuerpoCrudo, config.secretos, {
        ahoraS: Math.floor(reloj().getTime() / 1000),
      });
      if (!resultado.valida) {
        rechazos.push({ motivo: resultado.motivo, momento: reloj().toISOString() });
        return { status: 401, cuerpo: { ok: false, motivo: resultado.motivo } };
      }
      const id = cabeceras['x-webhook-id'];
      // el mismo evento puede llegar dos veces (reintento tras un timeout): se procesa una sola vez
      if (vistos.has(id)) return { status: 200, cuerpo: { ok: true, duplicado: true } };
      vistos.add(id);
      const evento = JSON.parse(cuerpoCrudo);
      recibidos.push({ id, tipo: evento.tipo, intento: Number(cabeceras['x-webhook-intento']), recibidoEn: reloj().toISOString() });
      return { status: 200, cuerpo: { ok: true } };
    },

    recibidos: () => [...recibidos],
    rechazos: () => [...rechazos],
  };
}
