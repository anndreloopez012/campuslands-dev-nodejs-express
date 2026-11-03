const molarMasses = new Map([
  ['H2O', 18.015],
  ['CO2', 44.01],
  ['NaCl', 58.44]
]);

export function getMolarMass(formula) {
  const mass = molarMasses.get(formula);
  if (mass === undefined) throw new Error('Fórmula no incluida en el catálogo.');
  return mass;
}
