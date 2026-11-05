import { crear } from '../errores/index.js';
import { analizar, convertir } from '../quimica/formula.js';
import {
  exigirCuerpo, leerOpcion, leerTexto, rechazarSobrantes, terminar,
} from '../validators/comunes.js';

export const CATEGORIAS = Object.freeze(['acido', 'base', 'sal', 'oxido', 'organico', 'otro']);

const SEMILLA = [
  { nombre: 'Agua', formula: 'H2O', categoria: 'oxido' },
  { nombre: 'Acido sulfurico', formula: 'H2SO4', categoria: 'acido' },
  { nombre: 'Hidroxido de calcio', formula: 'Ca(OH)2', categoria: 'base' },
  { nombre: 'Sulfato de cobre pentahidratado', formula: 'CuSO4\u00B75H2O', categoria: 'sal' },
  { nombre: 'Glucosa', formula: 'C6H12O6', categoria: 'organico' },
];

export function crearServicioQuimica({ elementos }) {
  const compuestos = [];
  let siguienteId = 1;

  function agregar({ nombre, formula, categoria }) {
    const analisis = analizar(formula, elementos);
    if (compuestos.some((c) => c.formula === formula)) throw crear('COMPUESTO_DUPLICADO', { formula });
    const compuesto = {
      id: siguienteId, nombre, formula, categoria, masaMolar: analisis.masaMolar,
    };
    siguienteId += 1;
    compuestos.push(compuesto);
    return compuesto;
  }
  SEMILLA.forEach(agregar);

  function compuesto(id) {
    const encontrado = compuestos.find((c) => c.id === id);
    if (!encontrado) throw crear('COMPUESTO_NO_ENCONTRADO', { compuestoId: id });
    return encontrado;
  }

  return {
    elementos: () => elementos,
    elemento(simbolo) {
      const encontrado = elementos.find((e) => e.simbolo === simbolo);
      if (!encontrado) throw crear('ELEMENTO_NO_ENCONTRADO', { simbolo });
      return encontrado;
    },

    analizar(cuerpo) {
      const errores = [];
      if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
      rechazarSobrantes(cuerpo, ['formula'], errores);
      const formula = leerTexto(cuerpo, 'formula', errores, { max: 100 });
      terminar(errores);
      return analizar(formula, elementos);
    },

    convertir(cuerpo) {
      const errores = [];
      if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
      rechazarSobrantes(cuerpo, ['formula', 'gramos'], errores);
      const formula = leerTexto(cuerpo, 'formula', errores, { max: 100 });
      if (typeof cuerpo.gramos !== 'number' || !(cuerpo.gramos > 0) || cuerpo.gramos > 1e6) {
        errores.push({ campo: 'gramos', mensaje: 'debe ser un numero mayor a 0 y hasta 1000000' });
      }
      terminar(errores);
      return convertir(formula, cuerpo.gramos, elementos);
    },

    listar({ categoria, q }) {
      return compuestos.filter((c) => (!categoria || c.categoria === categoria)
        && (!q || c.nombre.toLowerCase().includes(q.toLowerCase()) || c.formula.includes(q)));
    },

    obtener: (id) => ({ ...compuesto(id), analisis: analizar(compuesto(id).formula, elementos) }),

    crear(cuerpo) {
      const errores = [];
      if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
      rechazarSobrantes(cuerpo, ['nombre', 'formula', 'categoria'], errores);
      const datos = {
        nombre: leerTexto(cuerpo, 'nombre', errores, { min: 2, max: 80 }),
        formula: leerTexto(cuerpo, 'formula', errores, { max: 100 }),
        categoria: leerOpcion(cuerpo, 'categoria', CATEGORIAS, errores),
      };
      terminar(errores);
      return agregar(datos);
    },

    eliminar(id) {
      const actual = compuesto(id);
      compuestos.splice(compuestos.indexOf(actual), 1);
    },
  };
}
