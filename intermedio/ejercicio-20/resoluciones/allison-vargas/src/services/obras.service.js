import { obrasRepository } from '../repositories/obras.repository.js';
import { ConflictError, NotFoundError } from '../utils/errors.js';
import { paginar } from '../utils/paginacion.js';
import { leerListado, filtroEnum, filtroBooleano } from '../validators/consulta.js';
import { HERRAMIENTAS } from '../constants/obras.js';

const configListado = {
  filtros: {
    herramienta: filtroEnum(HERRAMIENTAS),
    publica: filtroBooleano,
    artista: (texto, error) => {
      const valor = texto.trim().toLowerCase();
      if (valor.length < 2 || valor.length > 60) {
        error('debe tener entre 2 y 60 caracteres');
        return undefined;
      }
      return valor;
    },
  },
  ordenes: {
    reciente: (a, b) => b.creadoEn.localeCompare(a.creadoEn) || b.id - a.id,
    titulo: (a, b) => a.titulo.localeCompare(b.titulo),
    id: (a, b) => a.id - b.id,
  },
  ordenPorDefecto: 'id',
};

const mismaObra = (obra, titulo, artista) =>
  obra.titulo.toLowerCase() === titulo.toLowerCase() && obra.artista.toLowerCase() === artista.toLowerCase();

export function obtener(id, { soloPublicas = false } = {}) {
  const obra = obrasRepository.buscar(id);
  if (!obra || (soloPublicas && !obra.publica)) throw new NotFoundError(`No existe la obra ${id}`, 'OBRA_NO_ENCONTRADA');
  return obra;
}

export function listar(query, { soloPublicas = false } = {}) {
  const consulta = leerListado(query, configListado);
  const { herramienta, publica, artista } = consulta.filtros;
  const filtradas = obrasRepository
    .listar((obra) =>
      (!soloPublicas || obra.publica)
      && (herramienta === undefined || obra.herramienta === herramienta)
      && (publica === undefined || obra.publica === publica)
      && (artista === undefined || obra.artista.toLowerCase().includes(artista)))
    .sort(consulta.comparador);
  return paginar(filtradas, consulta.pagina, consulta.limite);
}

export function crear(datos) {
  if (obrasRepository.listar((obra) => mismaObra(obra, datos.titulo, datos.artista)).length) {
    throw new ConflictError('Ese artista ya tiene una obra con ese titulo', 'OBRA_DUPLICADA');
  }
  return obrasRepository.crear({ publica: false, ...datos, creadoEn: new Date().toISOString() });
}

export function actualizar(id, cambios) {
  const actual = obtener(id);
  const titulo = cambios.titulo ?? actual.titulo;
  const artista = cambios.artista ?? actual.artista;
  const repetida = obrasRepository.listar((obra) => obra.id !== id && mismaObra(obra, titulo, artista));
  if (repetida.length) throw new ConflictError('Ese artista ya tiene una obra con ese titulo', 'OBRA_DUPLICADA');
  return obrasRepository.actualizar(id, cambios);
}

export function eliminar(id) {
  const obra = obtener(id);
  obrasRepository.eliminar(id);
  return obra;
}
