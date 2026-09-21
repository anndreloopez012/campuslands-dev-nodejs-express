import { DomainError } from "../errors.js";

const ATOMIC_MASS = Object.freeze({
  H: 1.008, He: 4.0026, Li: 6.94, Be: 9.0122, B: 10.81, C: 12.011, N: 14.007, O: 15.999, F: 18.998, Ne: 20.18,
  Na: 22.99, Mg: 24.305, Al: 26.982, Si: 28.085, P: 30.974, S: 32.06, Cl: 35.45, Ar: 39.948, K: 39.098, Ca: 40.078,
  Ti: 47.867, Cr: 51.996, Mn: 54.938, Fe: 55.845, Co: 58.933, Ni: 58.693, Cu: 63.546, Zn: 65.38, Br: 79.904, Ag: 107.87,
  Sn: 118.71, I: 126.9, Ba: 137.33, Au: 196.97, Hg: 200.59, Pb: 207.2,
});

const MAX_FORMULA_LENGTH = 100;
const MAX_EQUATION_LENGTH = 300;
const MAX_COUNT = 999;
const COUNT_PATTERN = /^[1-9]\d{0,2}$/;
const OPENER_OF = { ")": "(", "]": "[" };

const invalidFormula = (message) => new DomainError("INVALID_FORMULA", message);
const invalidEquation = (message) => new DomainError("INVALID_EQUATION", message);
const round = (value, decimals) => Math.round(value * 10 ** decimals) / 10 ** decimals;
const isKnownElement = (symbol) => Object.hasOwn(ATOMIC_MASS, symbol);

function addAtoms(target, atoms, factor = 1) {
  for (const [symbol, count] of Object.entries(atoms)) target[symbol] = (target[symbol] ?? 0) + count * factor;
  return target;
}

function readCount(text, index) {
  const digits = /^\d*/.exec(text.slice(index))[0];
  if (!digits) return { count: 1, next: index };
  if (!COUNT_PATTERN.test(digits)) throw invalidFormula(`Numero invalido "${digits}": debe estar entre 1 y ${MAX_COUNT} y no empezar por 0`);

  return { count: Number(digits), next: index + digits.length };
}

function parseGroups(text) {
  const stack = [{ opener: null, atoms: {} }];
  let index = 0;

  while (index < text.length) {
    const char = text[index];

    if (/[A-Z]/.test(char)) {
      const symbol = /[a-z]/.test(text[index + 1] ?? "") ? text.slice(index, index + 2) : char;
      if (!isKnownElement(symbol)) throw new DomainError("UNKNOWN_ELEMENT", `Elemento desconocido: ${symbol}`);

      const { count, next } = readCount(text, index + symbol.length);
      addAtoms(stack.at(-1).atoms, { [symbol]: count });
      index = next;
    } else if (char === "(" || char === "[") {
      stack.push({ opener: char, atoms: {} });
      index += 1;
    } else if (char === ")" || char === "]") {
      const group = stack.length > 1 ? stack.pop() : null;
      if (group?.opener !== OPENER_OF[char]) throw invalidFormula(`Cierre "${char}" sin apertura correspondiente en la posicion ${index}`);
      if (Object.keys(group.atoms).length === 0) throw invalidFormula("Grupo vacio entre parentesis");

      const { count, next } = readCount(text, index + 1);
      addAtoms(stack.at(-1).atoms, group.atoms, count);
      index = next;
    } else {
      throw invalidFormula(`Caracter inesperado "${char}" en la posicion ${index}`);
    }
  }

  if (stack.length > 1) throw invalidFormula(`Falta cerrar "${stack.at(-1).opener}"`);
  return stack[0].atoms;
}

function parseFormula(formula) {
  if (typeof formula !== "string" || !formula.trim()) throw invalidFormula("formula es obligatoria");

  const text = formula.trim();
  if (text.length > MAX_FORMULA_LENGTH) throw invalidFormula(`La formula es demasiado larga (maximo ${MAX_FORMULA_LENGTH} caracteres)`);

  const composition = {};
  text.split(/[·.]/).forEach((part, index) => {
    const [, digits, body] = index === 0 ? [null, "", part] : /^(\d*)([\s\S]*)$/.exec(part);
    const coefficient = digits ? readCount(digits, 0).count : 1;
    const atoms = parseGroups(body);

    if (Object.keys(atoms).length === 0) throw invalidFormula("La formula tiene una parte vacia (revisa los separadores · o .)");
    addAtoms(composition, atoms, coefficient);
  });

  return composition;
}

function toHillFormula(composition) {
  const symbols = Object.keys(composition).sort();
  const hasCarbon = "C" in composition;
  const ordered = hasCarbon ? ["C", ...(symbols.includes("H") ? ["H"] : []), ...symbols.filter((s) => s !== "C" && s !== "H")] : symbols;

  return ordered.map((symbol) => `${symbol}${composition[symbol] > 1 ? composition[symbol] : ""}`).join("");
}

const rawMass = (composition) => Object.entries(composition).reduce((sum, [symbol, count]) => sum + count * ATOMIC_MASS[symbol], 0);
const molarMass = (composition) => round(rawMass(composition), 3);

function analyzeFormula(formula) {
  const composition = parseFormula(formula);
  const total = rawMass(composition);
  const massPercent = Object.fromEntries(Object.entries(composition).map(([symbol, count]) => [symbol, round(((count * ATOMIC_MASS[symbol]) / total) * 100, 2)]));

  return { formula: formula.trim(), hill: toHillFormula(composition), composition, molarMass: molarMass(composition), massPercent };
}

function totalOfSide(side) {
  const total = {};

  for (const rawTerm of side.split("+")) {
    const term = rawTerm.trim();
    if (!term) throw invalidEquation("Hay un termino vacio en la ecuacion (revisa los signos + y la flecha)");

    const [, digits, formula] = /^(\d*)\s*([\s\S]+)$/.exec(term);
    if (digits && !COUNT_PATTERN.test(digits)) throw invalidEquation(`Coeficiente invalido "${digits}" en "${term}": debe estar entre 1 y ${MAX_COUNT} y no empezar por 0`);

    addAtoms(total, parseFormula(formula), digits ? Number(digits) : 1);
  }

  return total;
}

function checkBalance(equation) {
  if (typeof equation !== "string" || !equation.trim()) throw invalidEquation("equation es obligatoria");
  if (equation.length > MAX_EQUATION_LENGTH) throw invalidEquation(`La ecuacion es demasiado larga (maximo ${MAX_EQUATION_LENGTH} caracteres)`);

  const sides = equation.split(/->|=>|→/);
  if (sides.length !== 2) throw invalidEquation("La ecuacion debe tener exactamente una flecha (->, => o →)");

  const [reactants, products] = sides.map(totalOfSide);
  const difference = {};
  for (const symbol of new Set([...Object.keys(reactants), ...Object.keys(products)])) {
    const delta = (products[symbol] ?? 0) - (reactants[symbol] ?? 0);
    if (delta !== 0) difference[symbol] = delta;
  }

  return { balanced: Object.keys(difference).length === 0, reactants, products, difference };
}

export { isKnownElement, parseFormula, toHillFormula, molarMass, analyzeFormula, checkBalance };
