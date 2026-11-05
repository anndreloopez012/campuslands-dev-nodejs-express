import { TIPOS } from '../src/constants/taller.js';
import { Cola } from '../src/domain/cola.js';
import { crearServicios } from '../src/services/index.js';
import { crearGeneradorDeTokens, crearReloj } from './datos.js';

export function crearColaDePrueba({ tipos = TIPOS } = {}) {
  const tiempo = crearReloj();
  const cola = new Cola({ reloj: tiempo.reloj, tipos, generarToken: crearGeneradorDeTokens() });
  return { cola, ...tiempo };
}

export function crearEntorno(opciones = {}) {
  const tiempo = crearReloj();
  const servicios = crearServicios({
    reloj: tiempo.reloj,
    generarToken: crearGeneradorDeTokens(),
    ...opciones,
  });
  return { ...tiempo, servicios, cola: servicios.cola };
}

export const aceite = (extra = {}) => ({ tipo: 'cambio_aceite', carga: { litros: 2 }, ...extra });
export const frenos = (extra = {}) => ({ tipo: 'frenos', carga: { eje: 'delantero' }, ...extra });
export const lavado = (extra = {}) => ({ tipo: 'lavado', carga: {}, ...extra });
export const diagnostico = (extra = {}) => ({ tipo: 'diagnostico', carga: { sintomas: ['ruido_motor'] }, ...extra });

export const rechazaCon = (codigo, contexto) => (error) => {
  if (error?.codigo !== codigo) return false;
  if (contexto) {
    for (const [clave, valor] of Object.entries(contexto)) {
      if (error.contexto[clave] !== valor) return false;
    }
  }
  return true;
};

export const ORDEN_BASE = {
  cliente: 'Ana Lopez',
  moto: { marca: 'Yamaha', modelo: 'MT-03', cilindrada: 321, placa: 'm123abc' },
  sintomas: ['frenos_esponjosos', 'vibracion'],
  servicios: [{ tipo: 'frenos', eje: 'ambos' }, { tipo: 'afinacion', cilindrada: 321 }],
};
