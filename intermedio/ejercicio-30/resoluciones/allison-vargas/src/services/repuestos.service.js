import { ConflictError, NotFoundError } from '../utils/errors.js';
import { paginar } from '../utils/paginacion.js';
import { leerListado, filtroBooleano } from '../validators/consulta.js';

const configListado = {
  filtros: {
    disponible: filtroBooleano,
    buscar: (texto, error) => {
      if (texto.length < 1 || texto.length > 60) {
        error('debe tener entre 1 y 60 caracteres');
        return undefined;
      }
      return texto.toLowerCase();
    },
  },
  ordenes: {
    id: (a, b) => a.id - b.id,
    nombre: (a, b) => a.nombre.localeCompare(b.nombre),
    precio: (a, b) => a.precio - b.precio || a.id - b.id,
    stock: (a, b) => a.stock - b.stock || a.id - b.id,
  },
  ordenPorDefecto: 'id',
};

export function crearRepuestosService({ repositorio }) {
  const buscar = (id) => repositorio.buscar(id);

  function obtener(id) {
    const repuesto = repositorio.buscar(id);
    if (!repuesto) throw new NotFoundError(`No existe el repuesto ${id}`, 'REPUESTO_NO_ENCONTRADO');
    return repuesto;
  }

  function listar(query) {
    const consulta = leerListado(query, configListado);
    const { disponible, buscar: texto } = consulta.filtros;
    const filtrados = repositorio
      .listar((r) =>
        (disponible === undefined || (r.stock > 0) === disponible)
        && (texto === undefined
          || r.nombre.toLowerCase().includes(texto)
          || r.codigo.toLowerCase().includes(texto)))
      .sort(consulta.comparador);
    return paginar(filtrados, consulta.pagina, consulta.limite);
  }

  const todos = () => repositorio.listar();

  function crear(datos) {
    const codigo = datos.codigo.toUpperCase();
    if (repositorio.listar((r) => r.codigo === codigo).length) {
      throw new ConflictError(`Ya existe el repuesto ${codigo}`, 'REPUESTO_DUPLICADO');
    }
    return repositorio.crear({ ...datos, codigo });
  }

  function actualizar(id, cambios) {
    obtener(id);
    return repositorio.actualizar(id, cambios);
  }

  function reabastecer(id, cantidad) {
    const repuesto = obtener(id);
    return repositorio.actualizar(id, { stock: repuesto.stock + cantidad });
  }

  function descontar(id, cantidad) {
    const repuesto = obtener(id);
    if (repuesto.stock < cantidad) {
      throw new ConflictError(
        `Stock insuficiente de ${repuesto.codigo}: hay ${repuesto.stock} y se piden ${cantidad}`,
        'STOCK_INSUFICIENTE',
      );
    }
    return repositorio.actualizar(id, { stock: repuesto.stock - cantidad });
  }

  function devolver(id, cantidad) {
    const repuesto = obtener(id);
    return repositorio.actualizar(id, { stock: repuesto.stock + cantidad });
  }

  return { buscar, obtener, listar, todos, crear, actualizar, reabastecer, descontar, devolver };
}
