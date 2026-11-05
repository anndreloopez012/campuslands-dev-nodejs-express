import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { crear } from '../errores/index.js';

const huella = (secreto) => createHash('sha256').update(secreto).digest();

export const POLITICA = Object.freeze({
  inactividadMs: 7 * 24 * 60 * 60 * 1000,
  vidaMaximaMs: 30 * 24 * 60 * 60 * 1000,
  maxSesionesPorUsuario: 5,
});

// Una "familia" es una sesion: nace en el login y cada refresh agrega un token nuevo a la misma familia.
export function crearAlmacenSesiones({ reloj, politica = POLITICA, generarId = randomUUID }) {
  const familias = new Map();
  const tokens = new Map();

  const ahora = () => reloj().getTime();
  const iso = (ms) => new Date(ms).toISOString();

  function emitir(familia) {
    const id = generarId();
    const secreto = randomBytes(32).toString('base64url');
    const vence = Math.min(ahora() + politica.inactividadMs, familia.venceAbsoluto);
    tokens.set(id, {
      id, familiaId: familia.id, hash: huella(secreto), creadoEn: ahora(), venceEn: vence, usadoEn: null,
    });
    familia.ultimoUso = ahora();
    familia.tokenActual = id;
    return { refreshToken: `${id}.${secreto}`, venceEn: iso(vence) };
  }

  function revocarFamilia(familia, motivo) {
    if (!familia.revocadaEn) {
      familia.revocadaEn = ahora();
      familia.motivo = motivo;
    }
  }

  const activa = (familia) => !familia.revocadaEn && familia.venceAbsoluto > ahora();

  function activasDe(usuarioId) {
    return [...familias.values()].filter((f) => f.usuarioId === usuarioId && activa(f));
  }

  return {
    iniciar({ usuarioId, agente, ip }) {
      const abiertas = activasDe(usuarioId).sort((a, b) => a.creadaEn - b.creadaEn);
      while (abiertas.length >= politica.maxSesionesPorUsuario) revocarFamilia(abiertas.shift(), 'limite_de_sesiones');
      const familia = {
        id: generarId(),
        usuarioId,
        agente: agente ?? null,
        ip: ip ?? null,
        creadaEn: ahora(),
        venceAbsoluto: ahora() + politica.vidaMaximaMs,
        ultimoUso: ahora(),
        rotaciones: 0,
        revocadaEn: null,
        motivo: null,
        tokenActual: null,
      };
      familias.set(familia.id, familia);
      return { familiaId: familia.id, ...emitir(familia) };
    },

    rotar(presentado) {
      const [id, secreto, sobra] = typeof presentado === 'string' ? presentado.split('.') : [];
      const registro = id && secreto && sobra === undefined ? tokens.get(id) : undefined;
      if (!registro || !timingSafeEqual(registro.hash, huella(secreto))) throw crear('REFRESH_INVALIDO');
      const familia = familias.get(registro.familiaId);
      if (familia.revocadaEn) throw crear('SESION_REVOCADA', { motivo: familia.motivo });
      if (registro.usadoEn) {
        // alguien presento un token que ya se habia cambiado: o lo robaron o lo robaron y ya lo usaron.
        // como no se sabe quien es el legitimo, se cierra la sesion completa.
        revocarFamilia(familia, 'reuso_detectado');
        throw crear('REFRESH_REUTILIZADO');
      }
      if (registro.venceEn <= ahora()) {
        revocarFamilia(familia, 'expirada');
        throw crear('REFRESH_EXPIRADO');
      }
      registro.usadoEn = ahora();
      familia.rotaciones += 1;
      return { familiaId: familia.id, usuarioId: familia.usuarioId, ...emitir(familia) };
    },

    sesionActiva(familiaId) {
      const familia = familias.get(familiaId);
      return Boolean(familia && activa(familia));
    },

    revocar(familiaId, usuarioId, motivo = 'cierre_de_sesion') {
      const familia = familias.get(familiaId);
      if (!familia || familia.usuarioId !== usuarioId) throw crear('SESION_NO_ENCONTRADA', { sesionId: familiaId });
      revocarFamilia(familia, motivo);
    },

    revocarTodas(usuarioId, motivo = 'cierre_global') {
      const abiertas = activasDe(usuarioId);
      for (const familia of abiertas) revocarFamilia(familia, motivo);
      return abiertas.length;
    },

    listar(usuarioId) {
      return activasDe(usuarioId).map((f) => ({
        id: f.id,
        agente: f.agente,
        ip: f.ip,
        creadaEn: iso(f.creadaEn),
        ultimoUso: iso(f.ultimoUso),
        venceAbsoluto: iso(f.venceAbsoluto),
        rotaciones: f.rotaciones,
      }));
    },

    estado(familiaId) {
      const f = familias.get(familiaId);
      return f && { revocada: Boolean(f.revocadaEn), motivo: f.motivo };
    },
  };
}
