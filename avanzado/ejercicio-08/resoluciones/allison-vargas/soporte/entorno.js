import { BusDeEventos } from '../src/domain/bus.js';
import { crearServicios } from '../src/services/index.js';
import { crearReloj } from './datos.js';

export function crearBusDePrueba(opciones = {}) {
  const tiempo = crearReloj();
  return { bus: new BusDeEventos({ reloj: tiempo.reloj, ...opciones }), ...tiempo };
}

export function crearEntorno(opciones = {}) {
  const tiempo = crearReloj();
  return { ...tiempo, servicios: crearServicios({ reloj: tiempo.reloj, ...opciones }) };
}

export const rechazaCon = (codigo, contexto) => (error) => {
  if (error?.codigo !== codigo) return false;
  if (contexto) {
    for (const [clave, valor] of Object.entries(contexto)) {
      if (error.contexto[clave] !== valor) return false;
    }
  }
  return true;
};

export const SESION_BASE = { piloto: 'Lena Ortiz', auto: 'nevera', circuitoId: 2 };
export const VUELTA_BASE = { tiempoMs: 90000, tempMotor: 100, desgaste: 10 };

export const DATOS_DE = {
  'sesion:iniciada': { sesionId: 1, piloto: 'A B C', auto: 'nevera', circuitoId: 1 },
  'vuelta:completada': { sesionId: 1, vuelta: 1, tiempoMs: 90000, tempMotor: 100, desgaste: 10 },
  'sesion:finalizada': { sesionId: 1, vueltas: 1, mejorVueltaMs: 90000, motivo: 'fin' },
  'sesion:abortada': { sesionId: 1, vueltas: 1, motivo: 'bandera' },
};
