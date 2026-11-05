import { ConflictError, NotFoundError } from '../utils/errors.js';
import { paginar } from '../utils/paginacion.js';
import { leerListado, filtroEnum } from '../validators/consulta.js';
import { CATEGORIAS } from '../constants/quimica.js';

const configListado = {
  filtros: {
    categoria: filtroEnum(CATEGORIAS),
    buscar: (texto, error) => {
      const valor = texto.trim().toLowerCase();
      if (valor.length < 1 || valor.length > 40) {
        error('debe tener entre 1 y 40 caracteres');
        return undefined;
      }
      return valor;
    },
  },
  ordenes: {
    id: (a, b) => a.id - b.id,
    nombre: (a, b) => a.nombre.localeCompare(b.nombre),
    masa: (a, b) => a.masaMolar - b.masaMolar,
  },
  ordenPorDefecto: 'id',
};

export function crearCompuestosService({ repositorio, formulas, reloj = () => new Date() }) {
  function obtener(id) {
    const compuesto = repositorio.buscar(id);
    if (!compuesto) throw new NotFoundError(`No existe el compuesto ${id}`, 'COMPUESTO_NO_ENCONTRADO');
    return compuesto;
  }

  function listar(query) {
    const consulta = leerListado(query, configListado);
    const { categoria, buscar } = consulta.filtros;
    const filtrados = repositorio
      .listar((compuesto) =>
        (categoria === undefined || compuesto.categoria === categoria)
        && (buscar === undefined
          || compuesto.nombre.toLowerCase().includes(buscar)
          || compuesto.formula.toLowerCase().includes(buscar)))
      .sort(consulta.comparador);
    return paginar(filtrados, consulta.pagina, consulta.limite);
  }

  function crear({ nombre, formula, categoria }) {
    const masaMolar = formulas.masaMolar(formula);

    if (repositorio.listar((compuesto) => compuesto.formula === formula).length) {
      throw new ConflictError(`La formula ${formula} ya esta registrada`, 'FORMULA_DUPLICADA');
    }
    if (repositorio.listar((compuesto) => compuesto.nombre.toLowerCase() === nombre.toLowerCase()).length) {
      throw new ConflictError(`Ya existe un compuesto llamado ${nombre}`, 'NOMBRE_DUPLICADO');
    }

    return repositorio.crear({ nombre, formula, categoria, masaMolar, creadoEn: reloj().toISOString() });
  }

  function eliminar(id) {
    const compuesto = obtener(id);
    repositorio.eliminar(id);
    return compuesto;
  }

  return { obtener, listar, crear, eliminar };
}
