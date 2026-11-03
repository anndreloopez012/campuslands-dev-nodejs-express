const atomicMass = { H: 1.008, C: 12.011, N: 14.007, O: 15.999 };
const invalidFormula = (message) => Object.assign(new Error(message), { statusCode: 400 });

exports.molarMass = (formula) => {
  const parts = formula.match(/[A-Z][a-z]?\d*/g) || [];
  if (!parts.length || parts.join('') !== formula) throw invalidFormula('Fórmula no válida');
  return Number(parts.reduce((total, part) => {
    const [, element, count] = part.match(/^([A-Z][a-z]?)(\d*)$/);
    if (!atomicMass[element]) throw invalidFormula(`Elemento desconocido: ${element}`);
    return total + atomicMass[element] * Number(count || 1);
  }, 0).toFixed(3));
};
