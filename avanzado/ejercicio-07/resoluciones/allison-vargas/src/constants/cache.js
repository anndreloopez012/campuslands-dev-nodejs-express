export const CAPACIDAD = 100;

export const POLITICAS = Object.freeze({
  auto: { ttlMs: 60000, staleMs: 30000 },
  lista: { ttlMs: 30000, staleMs: 15000 },
  cotizacion: { ttlMs: 120000, staleMs: 0 },
  resumen: { ttlMs: 60000, staleMs: 0 },
  ausente: { ttlMs: 10000 },
});

export const AVANCE_MAXIMO_MS = 24 * 60 * 60 * 1000;
