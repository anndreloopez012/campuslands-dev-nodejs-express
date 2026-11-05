import { crear } from '../errores/index.js';

export const AVOGADRO = 6.02214076e23;
const CIERRES = { '(': ')', '[': ']' };

const fallo = (formula, posicion, motivo) => crear('FORMULA_INVALIDA', { formula, posicion, motivo });

function sumar(destino, origen, factor = 1) {
  for (const [simbolo, cantidad] of Object.entries(origen)) destino[simbolo] = (destino[simbolo] ?? 0) + cantidad * factor;
  return destino;
}

// gramatica: formula = parte ("\u00B7" parte)* ; parte = coeficiente? grupo+ ; grupo = (elemento | "(" grupo+ ")") numero?
export function parsearFormula(formula, simbolosValidos) {
  if (typeof formula !== 'string' || formula.length === 0 || formula.length > 100) throw fallo(String(formula), 0, 'debe tener de 1 a 100 caracteres');
  let i = 0;

  const numero = () => {
    const inicio = i;
    while (i < formula.length && /\d/.test(formula[i])) i += 1;
    if (i === inicio) return null;
    const valor = Number(formula.slice(inicio, i));
    if (valor === 0) throw fallo(formula, inicio, 'un subindice no puede ser 0');
    return valor;
  };

  function grupos(cierre) {
    const total = {};
    let alguno = false;
    while (i < formula.length && formula[i] !== cierre && !'\u00B7.*'.includes(formula[i])) {
      const c = formula[i];
      let parcial;
      if (CIERRES[c]) {
        const abre = i;
        i += 1;
        parcial = grupos(CIERRES[c]);
        if (formula[i] !== CIERRES[c]) throw fallo(formula, abre, `falta cerrar "${c}"`);
        i += 1;
      } else if (/[A-Z]/.test(c)) {
        const inicio = i;
        i += 1;
        while (i < formula.length && /[a-z]/.test(formula[i])) i += 1;
        const simbolo = formula.slice(inicio, i);
        if (!simbolosValidos.has(simbolo)) throw fallo(formula, inicio, `elemento desconocido "${simbolo}"`);
        parcial = { [simbolo]: 1 };
      } else {
        throw fallo(formula, i, `caracter inesperado "${c}"`);
      }
      sumar(total, parcial, numero() ?? 1);
      alguno = true;
    }
    if (!alguno) throw fallo(formula, i, 'grupo vacio');
    return total;
  }

  const composicion = {};
  for (;;) {
    const coeficiente = numero() ?? 1;
    sumar(composicion, grupos(undefined), coeficiente);
    if (i >= formula.length) break;
    if ('\u00B7.*'.includes(formula[i])) {
      i += 1;
      continue;
    }
    throw fallo(formula, i, `"${formula[i]}" sin abrir`);
  }
  return composicion;
}

const redondear = (valor, decimales) => Number(valor.toFixed(decimales));

export function analizar(formula, elementos) {
  const porSimbolo = new Map(elementos.map((e) => [e.simbolo, e]));
  const composicion = parsearFormula(formula, new Set(porSimbolo.keys()));
  const masaMolar = Object.entries(composicion).reduce((t, [s, n]) => t + porSimbolo.get(s).masa * n, 0);
  const detalle = Object.entries(composicion)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([simbolo, atomos]) => ({
      simbolo,
      nombre: porSimbolo.get(simbolo).nombre,
      atomos,
      masa: redondear(porSimbolo.get(simbolo).masa * atomos, 3),
      porcentaje: redondear((porSimbolo.get(simbolo).masa * atomos * 100) / masaMolar, 2),
    }));
  return {
    formula,
    masaMolar: redondear(masaMolar, 3),
    atomosTotales: Object.values(composicion).reduce((t, n) => t + n, 0),
    composicion: detalle,
  };
}

export function convertir(formula, gramos, elementos) {
  const { masaMolar } = analizar(formula, elementos);
  const moles = gramos / masaMolar;
  return {
    formula, gramos, masaMolar, moles: Number(moles.toPrecision(6)), moleculas: Number((moles * AVOGADRO).toPrecision(6)),
  };
}
