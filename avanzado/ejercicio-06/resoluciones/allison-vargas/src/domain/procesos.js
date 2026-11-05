export const SIN_RESPUESTA = Symbol('sin_respuesta');

export class FalloDeProceso extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = 'FalloDeProceso';
  }
}

const HALLAZGOS = Object.freeze({
  ruido_motor: 'holgura en valvulas',
  frenos_esponjosos: 'aire en el circuito de frenos',
  no_arranca: 'bateria descargada',
  vibracion: 'cadena floja',
  luces_tenues: 'regulador de voltaje debil',
  consumo_alto: 'filtro de aire saturado',
});

const SERVICIO_POR_SINTOMA = Object.freeze({
  ruido_motor: 'afinacion',
  frenos_esponjosos: 'frenos',
  no_arranca: 'electrica',
  vibracion: 'afinacion',
  luces_tenues: 'electrica',
  consumo_alto: 'cambio_aceite',
});

const COSTO_FRENOS = Object.freeze({ delantero: 180, trasero: 150, ambos: 300 });
const COSTO_ELECTRICA = Object.freeze({ bateria: 220, luces: 90, arranque: 260 });

export const PROCESOS = Object.freeze({
  diagnostico: (carga) => ({
    hallazgos: carga.sintomas.map((sintoma) => HALLAZGOS[sintoma]),
    serviciosSugeridos: [...new Set(carga.sintomas.map((sintoma) => SERVICIO_POR_SINTOMA[sintoma]))].sort(),
    costo: 50,
  }),
  cambio_aceite: (carga) => ({
    litros: carga.litros,
    costo: carga.litros * (carga.sintetico ? 95 : 60),
  }),
  frenos: (carga) => ({ eje: carga.eje, costo: COSTO_FRENOS[carga.eje] }),
  afinacion: (carga) => ({ costo: 120 + Math.ceil(carga.cilindrada / 250) * 20 }),
  electrica: (carga) => ({ componente: carga.componente, costo: COSTO_ELECTRICA[carga.componente] }),
  lavado: () => ({ costo: 40 }),
});

export function ejecutarProceso(trabajo) {
  if (trabajo.carga.colgar === true) return SIN_RESPUESTA;
  if (trabajo.intentos <= (trabajo.carga.fallosSimulados ?? 0)) {
    throw new FalloDeProceso(`fallo simulado en el intento ${trabajo.intentos}`);
  }
  return PROCESOS[trabajo.tipo](trabajo.carga);
}
