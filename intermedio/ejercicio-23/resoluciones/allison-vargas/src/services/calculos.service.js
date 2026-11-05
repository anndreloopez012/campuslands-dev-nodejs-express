import { CLASIFICACION, MATERIALES, PROCESOS } from '../constants/soldadura.js';
import { ValidationError } from '../utils/errors.js';

export function calcularCalorAporte({ proceso, voltaje, amperaje, velocidadMmMin }) {
  const datos = PROCESOS[proceso];
  if (!datos) throw new RangeError(`Proceso desconocido: ${proceso}`);
  if (!(velocidadMmMin > 0)) throw new RangeError('La velocidad debe ser mayor que cero');
  const kjPorMm = (voltaje * amperaje * 60) / (1000 * velocidadMmMin);
  return Math.round(kjPorMm * datos.eficiencia * 1000) / 1000;
}

export function clasificarCalor(calorKjMm) {
  if (calorKjMm <= CLASIFICACION.bajoHasta) return 'bajo';
  if (calorKjMm <= CLASIFICACION.medioHasta) return 'medio';
  return 'alto';
}

export function revisarRangos({ proceso, voltaje, amperaje }) {
  const { voltaje: [vMin, vMax], amperaje: [aMin, aMax] } = PROCESOS[proceso];
  const detalles = [];
  if (voltaje < vMin || voltaje > vMax) {
    detalles.push({ campo: 'voltaje', mensaje: `para ${PROCESOS[proceso].nombre} debe estar entre ${vMin} y ${vMax} V` });
  }
  if (amperaje < aMin || amperaje > aMax) {
    detalles.push({ campo: 'amperaje', mensaje: `para ${PROCESOS[proceso].nombre} debe estar entre ${aMin} y ${aMax} A` });
  }
  return detalles;
}

export function evaluar({ material, ...parametros }) {
  const limite = MATERIALES[material].limiteKjMm;
  const calorKjMm = calcularCalorAporte(parametros);
  return {
    proceso: parametros.proceso,
    material,
    eficiencia: PROCESOS[parametros.proceso].eficiencia,
    calorKjMm,
    clasificacion: clasificarCalor(calorKjMm),
    limiteKjMm: limite,
    dentroDeLimite: calorKjMm <= limite,
    rangosFuera: revisarRangos(parametros),
  };
}

export function calcular(datos) {
  const resultado = evaluar(datos);
  if (resultado.rangosFuera.length) {
    throw new ValidationError('Parametros fuera del rango del proceso', resultado.rangosFuera, 'RANGO_DE_PROCESO');
  }
  const { rangosFuera, ...respuesta } = resultado;
  return respuesta;
}
