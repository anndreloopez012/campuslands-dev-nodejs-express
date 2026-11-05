export const COMODIN = '*';

export const EVENTOS = Object.freeze({
  'sesion:iniciada': ['sesionId', 'piloto', 'auto', 'circuitoId'],
  'vuelta:completada': ['sesionId', 'vuelta', 'tiempoMs', 'tempMotor', 'desgaste'],
  'record:nuevo': ['sesionId', 'circuitoId', 'tiempoMs', 'anteriorMs', 'piloto', 'auto', 'vuelta'],
  'motor:sobrecalentado': ['sesionId', 'vuelta', 'tempMotor', 'consecutivos'],
  'neumaticos:desgastados': ['sesionId', 'vuelta', 'desgaste'],
  'sesion:finalizada': ['sesionId', 'vueltas', 'mejorVueltaMs', 'motivo'],
  'sesion:abortada': ['sesionId', 'vueltas', 'motivo'],
  'listener:error': ['suscripcionId', 'nombre', 'evento', 'mensaje'],
});

export const LISTA_DE_EVENTOS = Object.freeze(Object.keys(EVENTOS));
export const LISTA_CON_COMODIN = Object.freeze([...LISTA_DE_EVENTOS, COMODIN]);

export const LIMITES = Object.freeze({
  maxPorEvento: 15,
  profundidadMaxima: 6,
  capacidadHistorial: 500,
  maxFallos: 50,
  maxBuzones: 20,
  maxVueltas: 50,
});

export const UMBRALES = Object.freeze({
  temperatura: 120,
  alertasParaAbortar: 2,
  desgaste: 80,
});

export const TIEMPO_MINIMO_MS = 40000;
export const TIEMPO_MAXIMO_MS = 600000;
