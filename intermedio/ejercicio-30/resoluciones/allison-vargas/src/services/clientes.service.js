import { ConflictError, NotFoundError } from '../utils/errors.js';
import { paginar } from '../utils/paginacion.js';
import { leerListado } from '../validators/consulta.js';

const configListado = {
  filtros: {
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
  },
  ordenPorDefecto: 'id',
};

export function crearClientesService({ repositorio }) {
  const buscar = (id) => repositorio.buscar(id);

  function obtener(id) {
    const cliente = repositorio.buscar(id);
    if (!cliente) throw new NotFoundError(`No existe el cliente ${id}`, 'CLIENTE_NO_ENCONTRADO');
    return cliente;
  }

  function listar(query) {
    const consulta = leerListado(query, configListado);
    const { buscar: texto } = consulta.filtros;
    const filtrados = repositorio
      .listar((c) => texto === undefined || c.nombre.toLowerCase().includes(texto))
      .sort(consulta.comparador);
    return paginar(filtrados, consulta.pagina, consulta.limite);
  }

  function exigirTelefonoLibre(telefono, propioId) {
    if (repositorio.listar((c) => c.telefono === telefono && c.id !== propioId).length) {
      throw new ConflictError('Ya existe un cliente con ese telefono', 'TELEFONO_DUPLICADO');
    }
  }

  function crear(datos) {
    exigirTelefonoLibre(datos.telefono);
    return repositorio.crear(datos);
  }

  function actualizar(id, cambios) {
    obtener(id);
    if (cambios.telefono !== undefined) exigirTelefonoLibre(cambios.telefono, id);
    return repositorio.actualizar(id, cambios);
  }

  return { buscar, obtener, listar, crear, actualizar };
}
