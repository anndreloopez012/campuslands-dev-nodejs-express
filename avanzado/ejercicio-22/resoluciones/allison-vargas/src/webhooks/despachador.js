import { randomBytes } from 'node:crypto';
import { crear } from '../errores/index.js';
import { firmar } from './firma.js';

export const POLITICA_REINTENTOS = Object.freeze({ maxIntentos: 5, baseMs: 1000, factor: 2, timeoutMs: 5000 });
export const GRACIA_ROTACION_MS = 24 * 60 * 60 * 1000;

export const nuevoSecreto = () => `whsec_${randomBytes(24).toString('base64url')}`;
const nuevoId = (prefijo) => `${prefijo}_${randomBytes(8).toString('hex')}`;

export const transporteFetch = async ({ url, cabeceras, cuerpo, timeoutMs }) => {
  const respuesta = await fetch(url, {
    method: 'POST', headers: cabeceras, body: cuerpo, signal: AbortSignal.timeout(timeoutMs), redirect: 'manual',
  });
  return { status: respuesta.status };
};

export function crearDespachador({
  reloj, transporte = transporteFetch, programar = (fn, ms) => setTimeout(fn, ms), politica = POLITICA_REINTENTOS,
}) {
  const suscripciones = new Map();
  const eventos = [];
  const entregas = new Map();
  const ahoraMs = () => reloj().getTime();

  const publica = ({ secretos, ...s }) => ({ ...s, rotacionPendiente: secretos.length > 1 });
  const vigentes = (s) => s.secretos.filter((x) => x.hasta === null || x.hasta > ahoraMs()).map((x) => x.valor);

  function suscripcion(id) {
    const encontrada = suscripciones.get(id);
    if (!encontrada) throw crear('SUSCRIPCION_NO_ENCONTRADA', { suscripcionId: id });
    return encontrada;
  }

  function entrega(id) {
    const encontrada = entregas.get(id);
    if (!encontrada) throw crear('ENTREGA_NO_ENCONTRADA', { entregaId: id });
    return encontrada;
  }

  async function intentar(registro) {
    const sus = suscripciones.get(registro.suscripcionId);
    const evento = eventos.find((e) => e.id === registro.eventoId);
    if (!sus || !sus.activa) {
      registro.estado = 'descartada';
      return;
    }
    const cuerpo = JSON.stringify(evento);
    const ahoraS = Math.floor(ahoraMs() / 1000);
    // con dos secretos vigentes (rotacion) se firma con el mas nuevo
    const cabeceras = {
      'content-type': 'application/json',
      'user-agent': 'arquitectura-3d-webhooks/1.0',
      'x-webhook-id': evento.id,
      'x-webhook-evento': evento.tipo,
      'x-webhook-intento': String(registro.intentos.length + 1),
      'x-firma': firmar(vigentes(sus).at(-1), cuerpo, ahoraS),
    };
    const intento = { numero: registro.intentos.length + 1, momento: reloj().toISOString(), status: null, error: null };
    registro.intentos.push(intento);
    try {
      const { status } = await transporte({
        url: sus.url, cabeceras, cuerpo, timeoutMs: politica.timeoutMs,
      });
      intento.status = status;
    } catch (error) {
      intento.error = error.name === 'TimeoutError' ? 'tiempo agotado' : error.message;
    }
    if (intento.status >= 200 && intento.status < 300) {
      registro.estado = 'entregada';
      return;
    }
    if (intento.status === 410) {
      // 410 Gone: el receptor avisa que ya no quiere este webhook
      sus.activa = false;
      sus.desactivadaPor = 'el receptor respondio 410';
      registro.estado = 'descartada';
      return;
    }
    if (registro.intentos.length >= politica.maxIntentos) {
      registro.estado = 'fallida';
      registro.proximoIntento = null;
      return;
    }
    const espera = politica.baseMs * politica.factor ** (registro.intentos.length - 1);
    registro.proximoIntento = new Date(ahoraMs() + espera).toISOString();
    programar(() => intentar(registro), espera);
  }

  function despachar(evento, sus) {
    const registro = {
      id: nuevoId('ent'), eventoId: evento.id, suscripcionId: sus.id, tipo: evento.tipo, estado: 'pendiente', intentos: [], proximoIntento: null,
    };
    entregas.set(registro.id, registro);
    programar(() => intentar(registro), 0);
    return registro;
  }

  return {
    suscribir({ url, eventos: tipos, descripcion }) {
      const secreto = nuevoSecreto();
      const nueva = {
        id: nuevoId('sus'),
        url,
        eventos: tipos,
        descripcion: descripcion ?? null,
        activa: true,
        desactivadaPor: null,
        creadaEn: reloj().toISOString(),
        secretos: [{ valor: secreto, hasta: null }],
      };
      suscripciones.set(nueva.id, nueva);
      // el secreto solo se muestra una vez, al crear
      return { ...publica(nueva), secreto };
    },

    listar: () => [...suscripciones.values()].map(publica),
    obtener: (id) => publica(suscripcion(id)),

    eliminar(id) {
      suscripcion(id);
      suscripciones.delete(id);
    },

    rotarSecreto(id) {
      const sus = suscripcion(id);
      const secreto = nuevoSecreto();
      const hasta = ahoraMs() + GRACIA_ROTACION_MS;
      sus.secretos = [...sus.secretos.filter((s) => s.hasta === null || s.hasta > ahoraMs()).map((s) => ({ ...s, hasta: s.hasta ?? hasta })), { valor: secreto, hasta: null }];
      return { ...publica(sus), secreto, anteriorValidoHasta: new Date(hasta).toISOString() };
    },

    reactivar(id) {
      const sus = suscripcion(id);
      sus.activa = true;
      sus.desactivadaPor = null;
      return publica(sus);
    },

    emitir(tipo, datos) {
      const evento = {
        id: nuevoId('evt'), tipo, creadoEn: reloj().toISOString(), datos,
      };
      eventos.push(evento);
      const destinos = [...suscripciones.values()].filter((s) => s.activa && (s.eventos.includes('*') || s.eventos.includes(tipo)));
      const creadas = destinos.map((s) => despachar(evento, s));
      return { evento, entregas: creadas.length };
    },

    probar(id) {
      const sus = suscripcion(id);
      const evento = {
        id: nuevoId('evt'), tipo: 'ping', creadoEn: reloj().toISOString(), datos: { mensaje: 'prueba de webhook' },
      };
      eventos.push(evento);
      return despachar(evento, sus);
    },

    eventos: () => [...eventos],
    entregas: ({ estado, suscripcionId } = {}) => [...entregas.values()]
      .filter((e) => (!estado || e.estado === estado) && (!suscripcionId || e.suscripcionId === suscripcionId)),
    entrega,

    reintentar(id) {
      const registro = entrega(id);
      if (registro.estado !== 'fallida') throw crear('ENTREGA_NO_REINTENTABLE', { entregaId: id, estado: registro.estado });
      registro.estado = 'pendiente';
      registro.intentos = [];
      programar(() => intentar(registro), 0);
      return registro;
    },
  };
}
