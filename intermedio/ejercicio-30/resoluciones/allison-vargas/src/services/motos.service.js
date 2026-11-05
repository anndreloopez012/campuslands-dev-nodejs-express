import { ConflictError, NotFoundError, ReferenciaError } from '../utils/errors.js';
import { paginar } from '../utils/paginacion.js';
import { leerListado, filtroEntero } from '../validators/consulta.js';

const configListado = {
  filtros: {
    clienteId: filtroEntero(1, 1000000),
    buscar: (texto, error) => {
      if (texto.length < 1 || texto.length > 40) {
        error('debe tener entre 1 y 40 caracteres');
        return undefined;
      }
      return texto.toLowerCase();
    },
  },
  ordenes: {
    id: (a, b) => a.id - b.id,
    placa: (a, b) => a.placa.localeCompare(b.placa),
    anio: (a, b) => b.anio - a.anio || a.id - b.id,
  },
  ordenPorDefecto: 'id',
};

export function crearMotosService({ repositorio, clientes }) {
  const buscar = (id) => repositorio.buscar(id);

  function obtener(id) {
    const moto = repositorio.buscar(id);
    if (!moto) throw new NotFoundError(`No existe la moto ${id}`, 'MOTO_NO_ENCONTRADA');
    return moto;
  }

  function listar(query) {
    const consulta = leerListado(query, configListado);
    const { clienteId, buscar: texto } = consulta.filtros;
    const filtradas = repositorio
      .listar((m) =>
        (clienteId === undefined || m.clienteId === clienteId)
        && (texto === undefined
          || [m.placa, m.marca, m.modelo].some((campo) => campo.toLowerCase().includes(texto))))
      .sort(consulta.comparador);
    return paginar(filtradas, consulta.pagina, consulta.limite);
  }

  function exigirCliente(clienteId) {
    if (!clientes.buscar(clienteId)) throw new ReferenciaError('clienteId', `No existe el cliente ${clienteId}`);
  }

  function crear(datos) {
    exigirCliente(datos.clienteId);
    const placa = datos.placa.toUpperCase();
    if (repositorio.listar((m) => m.placa === placa).length) {
      throw new ConflictError(`Ya existe una moto con la placa ${placa}`, 'PLACA_DUPLICADA');
    }
    return repositorio.crear({ ...datos, placa });
  }

  function actualizar(id, cambios) {
    obtener(id);
    if (cambios.clienteId !== undefined) exigirCliente(cambios.clienteId);
    return repositorio.actualizar(id, cambios);
  }

  return { buscar, obtener, listar, crear, actualizar };
}
