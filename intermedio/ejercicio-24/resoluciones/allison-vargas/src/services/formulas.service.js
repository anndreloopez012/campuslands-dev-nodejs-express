import { ValidationError } from '../utils/errors.js';
import { AVOGADRO } from '../constants/quimica.js';

const redondear = (valor, decimales) => {
  const factor = 10 ** decimales;
  return Math.round(valor * factor) / factor;
};

const errorFormula = (mensaje, posicion, campo = 'formula') =>
  new ValidationError('Formula invalida', [{ campo, mensaje, posicion }], 'FORMULA_INVALIDA');

const sumar = (destino, origen, factor = 1) => {
  for (const [simbolo, cantidad] of Object.entries(origen)) {
    destino[simbolo] = (destino[simbolo] ?? 0) + cantidad * factor;
  }
};

const CIERRES = { '(': ')', '[': ']' };

export function crearFormulasService({ elementos }) {
  function parsearGrupo(texto, desplazamiento = 0) {
    const pila = [{ conteo: {}, cierre: null, apertura: -1 }];
    let i = 0;

    const leerNumero = () => {
      const inicio = i;
      while (i < texto.length && texto[i] >= '0' && texto[i] <= '9') i += 1;
      if (i === inicio) return 1;
      const valor = Number(texto.slice(inicio, i));
      if (valor < 1 || valor > 999) {
        throw errorFormula('los subindices deben estar entre 1 y 999', desplazamiento + inicio);
      }
      return valor;
    };

    while (i < texto.length) {
      const caracter = texto[i];

      if (caracter in CIERRES) {
        pila.push({ conteo: {}, cierre: CIERRES[caracter], apertura: i });
        i += 1;
      } else if (caracter === ')' || caracter === ']') {
        const actual = pila[pila.length - 1];
        if (actual.cierre !== caracter) {
          throw errorFormula(`el signo ${caracter} no tiene apertura`, desplazamiento + i);
        }
        i += 1;
        const multiplicador = leerNumero();
        pila.pop();
        sumar(pila[pila.length - 1].conteo, actual.conteo, multiplicador);
      } else if (caracter >= 'A' && caracter <= 'Z') {
        const inicio = i;
        i += 1;
        if (i < texto.length && texto[i] >= 'a' && texto[i] <= 'z') i += 1;
        const simbolo = texto.slice(inicio, i);
        if (!Object.hasOwn(elementos, simbolo)) {
          throw new ValidationError('Formula invalida', [{ campo: 'formula', mensaje: `el elemento ${simbolo} no esta en la tabla`, posicion: desplazamiento + inicio }], 'ELEMENTO_DESCONOCIDO');
        }
        const cantidad = leerNumero();
        sumar(pila[pila.length - 1].conteo, { [simbolo]: cantidad });
      } else {
        throw errorFormula(`caracter no valido "${caracter}"`, desplazamiento + i);
      }
    }

    if (pila.length > 1) {
      const sinCerrar = pila[pila.length - 1];
      throw errorFormula(`falta cerrar con ${sinCerrar.cierre}`, desplazamiento + sinCerrar.apertura);
    }
    if (!Object.keys(pila[0].conteo).length) throw errorFormula('la formula no tiene elementos', desplazamiento);
    return pila[0].conteo;
  }

  function parsear(formula) {
    if (typeof formula !== 'string' || !formula.trim()) throw errorFormula('la formula esta vacia', 0);
    const texto = formula.trim();
    if (texto.length > 80) throw errorFormula('la formula es demasiado larga', 80);

    const total = {};
    let posicion = 0;
    for (const parte of texto.split('.')) {
      const coeficiente = /^\d+/.exec(parte)?.[0] ?? '';
      const resto = parte.slice(coeficiente.length);
      if (coeficiente && posicion === 0) {
        throw errorFormula('la formula no puede empezar con un coeficiente', 0);
      }
      sumar(total, parsearGrupo(resto, posicion + coeficiente.length), coeficiente ? Number(coeficiente) : 1);
      posicion += parte.length + 1;
    }
    return total;
  }

  function masaDe(conteo) {
    let masa = 0;
    for (const [simbolo, cantidad] of Object.entries(conteo)) masa += elementos[simbolo].masa * cantidad;
    return redondear(masa, 3);
  }

  const masaMolar = (formula) => masaDe(parsear(formula));

  function analizar(formula) {
    const conteo = parsear(formula);
    const masa = masaDe(conteo);
    const composicion = Object.entries(conteo).map(([simbolo, atomos]) => {
      const masaElemento = elementos[simbolo].masa * atomos;
      return {
        simbolo,
        nombre: elementos[simbolo].nombre,
        atomos,
        masa: redondear(masaElemento, 3),
        porcentaje: redondear((masaElemento / masa) * 100, 2),
      };
    });
    return { formula: formula.trim(), masaMolar: masa, atomosTotales: Object.values(conteo).reduce((a, b) => a + b, 0), composicion };
  }

  function convertir({ formula, gramos, moles }) {
    if ((gramos === undefined) === (moles === undefined)) {
      throw new ValidationError('Datos invalidos', [{ campo: 'gramos', mensaje: 'envia gramos o moles, pero no ambos ni ninguno' }]);
    }
    const masa = masaMolar(formula);
    const molesCalculados = moles ?? gramos / masa;
    return {
      formula: formula.trim(),
      masaMolar: masa,
      gramos: redondear(gramos ?? moles * masa, 4),
      moles: redondear(molesCalculados, 6),
      moleculas: molesCalculados * AVOGADRO,
    };
  }

  function leerLado(texto, campo) {
    const conteo = {};
    const terminos = texto.split('+').map((parte) => parte.trim());
    if (terminos.some((termino) => !termino)) throw errorFormula('hay un termino vacio', 0, campo);
    const detalle = terminos.map((termino) => {
      const coeficiente = /^\d+/.exec(termino)?.[0] ?? '';
      const formula = termino.slice(coeficiente.length).trim();
      const factor = coeficiente ? Number(coeficiente) : 1;
      if (factor < 1 || factor > 999) throw errorFormula('los coeficientes deben estar entre 1 y 999', 0, campo);
      sumar(conteo, parsear(formula), factor);
      return { formula, coeficiente: factor };
    });
    return { conteo, detalle };
  }

  function verificarEcuacion(ecuacion) {
    if (typeof ecuacion !== 'string' || !/->|=/.test(ecuacion)) {
      throw errorFormula('la ecuacion debe tener reactivos y productos separados por -> o =', 0, 'ecuacion');
    }
    const [izquierda, derecha, ...sobrantes] = ecuacion.split(/->|=/);
    if (sobrantes.length) throw errorFormula('la ecuacion solo puede tener un separador', 0, 'ecuacion');

    const reactivos = leerLado(izquierda, 'ecuacion');
    const productos = leerLado(derecha, 'ecuacion');

    const simbolos = [...new Set([...Object.keys(reactivos.conteo), ...Object.keys(productos.conteo)])];
    const diferencias = simbolos
      .map((simbolo) => ({ elemento: simbolo, reactivos: reactivos.conteo[simbolo] ?? 0, productos: productos.conteo[simbolo] ?? 0 }))
      .filter((fila) => fila.reactivos !== fila.productos);

    return {
      balanceada: diferencias.length === 0,
      reactivos: { terminos: reactivos.detalle, atomos: reactivos.conteo },
      productos: { terminos: productos.detalle, atomos: productos.conteo },
      diferencias,
    };
  }

  return { parsear, masaMolar, analizar, convertir, verificarEcuacion };
}
