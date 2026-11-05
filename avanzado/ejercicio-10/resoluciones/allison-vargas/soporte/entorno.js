import { crearServicios } from '../src/services/index.js';

export const AHORA = new Date('2026-11-05T12:00:00.000Z');

export const ENCABEZADO = 'fecha,torneo,local,visita,mejorDe,setsLocal,setsVisita,puntosLocal,puntosVisita';

export const SEMILLA = [
  ENCABEZADO,
  '2026-01-10,Copa Verano,Ana Paz,Luis Gil,5,3,1,45,30',
  '2026-01-11,Copa Verano,Luis Gil,Marta Ruiz,5,3,2,50,47',
  '2026-01-12,Liga Municipal,Ana Paz,Marta Ruiz,3,2,0,22,10',
  '2026-02-01,Liga Municipal,Marta Ruiz,Ana Paz,3,2,1,30,28',
].join('\n');

export function crearEntorno({ semilla = SEMILLA, reloj = () => AHORA } = {}) {
  return { servicios: crearServicios({ semilla, reloj }) };
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

export const csv = (...lineas) => `${lineas.join('\n')}\n`;

export const fila = (cambios = {}) => {
  const base = {
    fecha: '2026-03-01', torneo: 'Copa Prueba', local: 'Eva Lara', visita: 'Raul Mora', mejorDe: '5', setsLocal: '3', setsVisita: '1', puntosLocal: '40', puntosVisita: '30',
  };
  return { ...base, ...cambios };
};

export const lineaDe = (f) => [f.fecha, f.torneo, f.local, f.visita, f.mejorDe, f.setsLocal, f.setsVisita, f.puntosLocal, f.puntosVisita].join(',');
