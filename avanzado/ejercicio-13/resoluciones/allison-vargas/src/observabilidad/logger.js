import { crearRedactor } from './redaccion.js';

export const NIVELES = Object.freeze({ debug: 10, info: 20, warn: 30, error: 40 });
export const NOMBRES_NIVELES = Object.freeze(Object.keys(NIVELES));

export function serializarError(error) {
  if (!(error instanceof Error)) return error;
  const salida = { tipo: error.name, mensaje: error.message };
  if (error.codigo) salida.codigo = error.codigo;
  if (error.stack) salida.pila = error.stack.split('\n').slice(0, 8).join('\n');
  if (error.cause instanceof Error) salida.causa = serializarError(error.cause);
  return salida;
}

export function crearLogger({
  nivel = 'info',
  destinos = [],
  reloj = () => new Date(),
  contexto = {},
  claves,
  alFallarDestino = () => {},
} = {}) {
  if (!NIVELES[nivel]) throw new TypeError(`Nivel desconocido: ${nivel}`);
  const estado = { nivel };
  const { redactar } = crearRedactor(claves);

  function construir(ctx) {
    function escribir(nivelEntrada, mensaje, datos = {}) {
      if (NIVELES[nivelEntrada] < NIVELES[estado.nivel]) return;
      const extra = { ...datos };
      if (extra.error !== undefined) extra.error = serializarError(extra.error);
      const entrada = redactar({
        tiempo: reloj().toISOString(),
        nivel: nivelEntrada,
        mensaje,
        ...ctx,
        ...extra,
      });
      for (const destino of destinos) {
        try {
          destino(entrada);
        } catch (error) {
          alFallarDestino(error);
        }
      }
    }

    return Object.freeze({
      debug: (mensaje, datos) => escribir('debug', mensaje, datos),
      info: (mensaje, datos) => escribir('info', mensaje, datos),
      warn: (mensaje, datos) => escribir('warn', mensaje, datos),
      error: (mensaje, datos) => escribir('error', mensaje, datos),
      hijo: (extra) => construir({ ...ctx, ...extra }),
      habilitado: (nombre) => NIVELES[nombre] >= NIVELES[estado.nivel],
      get nivel() { return estado.nivel; },
      cambiarNivel(nuevo) {
        if (!NIVELES[nuevo]) throw new TypeError(`Nivel desconocido: ${nuevo}`);
        const anterior = estado.nivel;
        estado.nivel = nuevo;
        return anterior;
      },
      get contexto() { return { ...ctx }; },
    });
  }

  return construir(contexto);
}
