import { DependenciaError } from '../utils/errors.js';

const NO_DISPONIBLE = 'ANTICHEAT_NO_DISPONIBLE';

export function crearAnticheatHttp({
  url,
  timeoutMs = 2000,
  reintentos = 1,
  fetchFn = (...args) => globalThis.fetch(...args),
}) {
  const base = url.replace(/\/+$/, '');

  async function pedir(ruta) {
    const control = new AbortController();
    const temporizador = setTimeout(() => control.abort(), timeoutMs);
    try {
      return await fetchFn(`${base}${ruta}`, {
        headers: { accept: 'application/json' },
        signal: control.signal,
      });
    } finally {
      clearTimeout(temporizador);
    }
  }

  async function conReintentos(ruta) {
    let causa;
    for (let intento = 0; intento <= reintentos; intento += 1) {
      try {
        const respuesta = await pedir(ruta);
        if (respuesta.status < 500) return respuesta;
        causa = new Error(`El anticheat respondio ${respuesta.status}`);
      } catch (error) {
        causa = error;
      }
    }
    throw new DependenciaError('El servicio anticheat no esta disponible', NO_DISPONIBLE, causa);
  }

  async function verificar(nick) {
    const respuesta = await conReintentos(`/jugadores/${encodeURIComponent(nick)}`);
    if (respuesta.status === 404) return { limpio: true };
    if (!respuesta.ok) {
      throw new DependenciaError(`El anticheat respondio ${respuesta.status}`, NO_DISPONIBLE);
    }
    let cuerpo;
    try {
      cuerpo = await respuesta.json();
    } catch (error) {
      throw new DependenciaError('El anticheat devolvio una respuesta ilegible', NO_DISPONIBLE, error);
    }
    return { limpio: cuerpo.baneado !== true, motivo: cuerpo.motivo };
  }

  async function ping() {
    const respuesta = await conReintentos('/salud');
    if (!respuesta.ok) throw new DependenciaError(`El anticheat respondio ${respuesta.status}`, NO_DISPONIBLE);
    return true;
  }

  return { tipo: 'http', verificar, ping };
}
