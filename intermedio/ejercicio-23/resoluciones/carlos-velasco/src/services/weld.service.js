const JUNTAS_VALIDAS = ['butt', 'esquina', 'traslape'];

/**
 * Evaluacion de una junta soldada (logica pura, sin HTTP).
 * Esta funcion es el objetivo del test: casos dominables,
 * ni objetos de red ni base de datos.
 *
 * Reglas de negocio:
 * - La junta falla si la penetracion < 80% o si hay porosidad alta.
 * - La resistencia nominal depende del tipo de junta.
 */
const RESISTENCIA_NOMINAL_MPA = {
  butt: 480,
  esquina: 380,
  traslape: 320
};

function evaluarJunta(datos) {
  const { tipo, penetracion_pct, porosidad } = datos;

  if (!JUNTAS_VALIDAS.includes(tipo)) {
    return { valida: false, motivo: 'tipo_invalido' };
  }
  if (typeof penetracion_pct !== 'number' || penetracion_pct < 0 || penetracion_pct > 100) {
    return { valida: false, motivo: 'penetracion_invalida' };
  }
  if (!['baja', 'media', 'alta', null, undefined].includes(porosidad)) {
    return { valida: false, motivo: 'porosidad_invalida' };
  }

  const profundidadOk = penetracion_pct >= 80;
  const porosidadOk = porosidad !== 'alta';

  if (!profundidadOk) {
    return { valida: false, motivo: 'penetracion_insuficiente' };
  }
  if (!porosidadOk) {
    return { valida: false, motivo: 'porosidad_alta' };
  }

  const resistNominal = RESISTENCIA_NOMINAL_MPA[tipo];
  const resistencia = Math.round(resistNominal * (penetracion_pct / 100));

  return { valida: true, resistencia_mpa: resistencia };
}

function clasificar(resistenciaMpa) {
  if (typeof resistenciaMpa !== 'number' || resistenciaMpa <= 0) {
    throw new TypeError('La resistencia debe ser un numero positivo');
  }
  if (resistenciaMpa >= 460) return 'estructural';
  if (resistenciaMpa >= 350) return 'industrial';
  return 'ligera';
}

module.exports = { evaluarJunta, clasificar, JUNTAS_VALIDAS };
