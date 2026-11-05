export const ESTADOS = Object.freeze({
  BLOQUEADA: 'bloqueada',
  PROGRAMADA: 'programada',
  PENDIENTE: 'pendiente',
  EN_PROCESO: 'en_proceso',
  COMPLETADA: 'completada',
  MUERTA: 'muerta',
  CANCELADA: 'cancelada',
});

export const LISTA_DE_ESTADOS = Object.freeze(Object.values(ESTADOS));

export const PRIORIDADES = Object.freeze({ URGENTE: 0, ALTA: 1, NORMAL: 2, BAJA: 3 });

export const TIPOS = Object.freeze({
  diagnostico: Object.freeze({ concurrencia: 2, leaseMs: 30000, maxIntentos: 3, backoffBaseMs: 1000, backoffMaxMs: 60000 }),
  cambio_aceite: Object.freeze({ concurrencia: 2, leaseMs: 30000, maxIntentos: 3, backoffBaseMs: 1000, backoffMaxMs: 60000 }),
  frenos: Object.freeze({ concurrencia: 1, leaseMs: 60000, maxIntentos: 3, backoffBaseMs: 2000, backoffMaxMs: 60000 }),
  afinacion: Object.freeze({ concurrencia: 1, leaseMs: 60000, maxIntentos: 3, backoffBaseMs: 2000, backoffMaxMs: 60000 }),
  electrica: Object.freeze({ concurrencia: 1, leaseMs: 45000, maxIntentos: 4, backoffBaseMs: 1000, backoffMaxMs: 30000 }),
  lavado: Object.freeze({ concurrencia: 2, leaseMs: 20000, maxIntentos: 2, backoffBaseMs: 500, backoffMaxMs: 5000 }),
});

export const NOMBRES_DE_TIPO = Object.freeze(Object.keys(TIPOS));
export const SERVICIOS = Object.freeze(['cambio_aceite', 'frenos', 'afinacion', 'electrica']);

export const SINTOMAS = Object.freeze([
  'ruido_motor',
  'frenos_esponjosos',
  'no_arranca',
  'vibracion',
  'luces_tenues',
  'consumo_alto',
]);

export const EJES = Object.freeze(['delantero', 'trasero', 'ambos']);
export const COMPONENTES = Object.freeze(['bateria', 'luces', 'arranque']);

export const MAX_EXTENSIONES = 3;
export const MAX_DEPENDENCIAS = 10;
export const RETRASO_MAXIMO_MS = 24 * 60 * 60 * 1000;
export const AVANCE_MAXIMO_MS = 24 * 60 * 60 * 1000;
export const LOTE_MAXIMO = 20;
