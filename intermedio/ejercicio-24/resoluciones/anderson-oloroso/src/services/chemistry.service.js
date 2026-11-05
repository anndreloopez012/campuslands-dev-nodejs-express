const PESOS_ATOMICOS = { H: 1.008, C: 12.011, O: 15.999, N: 14.007, Na: 22.99, Cl: 35.45 };

export const calcularMasaMolecular = (formula) => {
  if (!formula || typeof formula !== 'string') {
    throw new Error('La fórmula debe ser una cadena válida.');
  }

  // Parser simple para fórmulas comunes: H2O, CO2, NaCl
  let masa = 0;
  if (formula === 'H2O') masa = PESOS_ATOMICOS.H * 2 + PESOS_ATOMICOS.O;
  else if (formula === 'CO2') masa = PESOS_ATOMICOS.C + PESOS_ATOMICOS.O * 2;
  else if (formula === 'NaCl') masa = PESOS_ATOMICOS.Na + PESOS_ATOMICOS.Cl;
  else if (formula === 'O2') masa = PESOS_ATOMICOS.O * 2;
  else throw new Error(`Fórmula "${formula}" no soportada por el analizador.`);

  return { formula, masaMolecularGmol: Number(masa.toFixed(3)) };
};
