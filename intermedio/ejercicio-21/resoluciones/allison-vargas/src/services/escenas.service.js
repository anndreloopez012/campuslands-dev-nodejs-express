import { escenasRepository } from '../repositories/escenas.repository.js';
import { ConflictError, NotFoundError } from '../utils/errors.js';
import { paginar } from '../utils/paginacion.js';
import { leerListado, filtroEnum } from '../validators/consulta.js';
import { ESTADOS, MULTIPLICADOR_RENDER, RESOLUCIONES } from '../constants/escenas.js';

const configListado = {
  filtros: { estado: filtroEnum(ESTADOS), resolucion: filtroEnum(RESOLUCIONES) },
  ordenes: {
    id: (a, b) => a.id - b.id,
    titulo: (a, b) => a.titulo.localeCompare(b.titulo),
    reciente: (a, b) => b.creadoEn.localeCompare(a.creadoEn) || b.id - a.id,
  },
  ordenPorDefecto: 'id',
};

export function obtener(id) {
  const escena = escenasRepository.buscar(id);
  if (!escena) throw new NotFoundError(`No existe la escena ${id}`, 'ESCENA_NO_ENCONTRADA');
  return escena;
}

export function listar(query) {
  const consulta = leerListado(query, configListado);
  const { estado, resolucion } = consulta.filtros;
  const filtradas = escenasRepository
    .listar((escena) =>
      (estado === undefined || escena.estado === estado)
      && (resolucion === undefined || escena.resolucion === resolucion))
    .sort(consulta.comparador);
  return paginar(filtradas, consulta.pagina, consulta.limite);
}

export function crear(datos) {
  return escenasRepository.crear({ ...datos, estado: 'borrador', creadoEn: new Date().toISOString() });
}

export function enviarARender(id) {
  const escena = obtener(id);
  if (escena.estado !== 'borrador') {
    throw new ConflictError(`La escena ya esta en estado ${escena.estado}`, 'ESCENA_NO_RENDERIZABLE');
  }
  const actualizada = escenasRepository.actualizar(id, { estado: 'renderizando' });
  const cuadros = actualizada.fps * actualizada.duracionSeg;
  return {
    escena: actualizada,
    cuadros,
    tiempoEstimadoSeg: Math.ceil((cuadros * MULTIPLICADOR_RENDER[actualizada.resolucion]) / 50),
  };
}
