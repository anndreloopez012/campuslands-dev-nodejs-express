/**
 * Logica pura del laboratorio: dado un compuesto calcula su masa molar.
 * Sin IO, sin HTTP: perfectamente testeable.
 *
 * Tabla simplificada de masas atomicas (g/mol).
 */
const MASAS = {
  H: 1.008,
  C: 12.011,
  O: 15.999,
  N: 14.007,
  Na: 22.990,
  Cl: 35.453
};

/**
 * Parsea una formula tipo "H2O", "NaCl", "C6H12O6".
 * Devuelve un mapa ordenado de { elemento: cantidad }.
 * Lanza TypeError si la formula es invalida.
 */
function parsearFormula(formula) {
  if (typeof formula !== 'string' || formula.length === 0) {
    throw new TypeError('La formula debe ser un string no vacio');
  }

  const resultado = {};
  const regex = /([A-Z][a-z]?)(\d*)/g;

  // Consumo posicional para detectar caracteres no validos
  let indice = 0;
  let match;
  while ((match = regex.exec(formula)) !== null) {
    if (match.index !== indice) throw new TypeError(`Formula invalida en la posicion ${indice}`);

    const elemento = match[1];
    const cantidad = match[2] === '' ? 1 : Number(match[2]);
    if (cantidad === 0) throw new TypeError('Las cantidades deben ser >= 1');

    resultado[elemento] = (resultado[elemento] || 0) + cantidad;
    indice = regex.lastIndex;
  }

  if (indice !== formula.length) {
    throw new TypeError(`Formula invalida: "${formula}"`);
  }

  return resultado;
}

/** NULL-safe: dado el mapa del parseo devuelve masa molar en g/mol. */
function masaMolar(mapa) {
  let total = 0;
  for (const [elemento, cantidad] of Object.entries(mapa)) {
    if (!(elemento in MASAS)) {
      throw new TypeError(`Elemento desconocido: ${elemento}`);
    }
    total += MASAS[elemento] * cantidad;
  }
  // Redondeo a 3 decimales para respuestas estables
  return Number(total.toFixed(3));
}

/**
 * Calcula el porcentaje en masa de un elemento en una formula,
 * p.ej. el O2 en "NaClO3".
 */
function porcentajeElemento(formula, elemento) {
  const mapa = parsearFormula(formula);

  if (!(elemento in MASAS)) {
    throw new TypeError(`Elemento desconocido: ${elemento}`);
  }
  if (!(elemento in mapa)) {
    throw new TypeError(`El elemento ${elemento} no aparece en la formula ${formula}`);
  }

  const porcentaje = ((MASAS[elemento] * mapa[elemento]) / masaMolar(mapa)) * 100;
  return Number(porcentaje.toFixed(2));
}

module.exports = { parsearFormula, masaMolar, porcentajeElemento, MASAS };
