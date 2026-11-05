import { atomicMasses } from '../data/formulas.data.js';

// Separa "H2O" en { H: 2, O: 1 } (sin paréntesis, para mantenerlo simple)
export const parseFormula = (formula) => {
  const regex = /([A-Z][a-z]?)(\d*)/g;
  const counts = {};
  let consumed = '';
  let match;

  while ((match = regex.exec(formula)) !== null && match[0] !== '') {
    consumed += match[0];
    counts[match[1]] = (counts[match[1]] || 0) + (Number(match[2]) || 1);
  }

  if (!formula || consumed !== formula) throw new Error('Fórmula inválida: ' + formula);
  return counts;
};

export const molarMass = (formula) => {
  const counts = parseFormula(formula);
  let total = 0;

  for (const [element, qty] of Object.entries(counts)) {
    if (!(element in atomicMasses)) throw new Error('Elemento desconocido: ' + element);
    total += atomicMasses[element] * qty;
  }
  return Math.round(total * 1000) / 1000;
};
