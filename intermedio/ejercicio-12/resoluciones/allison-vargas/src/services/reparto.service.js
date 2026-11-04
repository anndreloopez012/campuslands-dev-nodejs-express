import { repartoRepository } from '../repositories/reparto.repository.js';
import { ConflictError, NotFoundError } from '../utils/errors.js';
import { normalizar } from '../utils/texto.js';
import { paginar } from '../utils/paginacion.js';
import { leerListado, filtroBooleano } from '../validators/consulta.js';

const MAX_PRINCIPALES = 3;
const collator = new Intl.Collator('es', { sensitivity: 'base' });

const ordenes = {
  principales: (a, b) => Number(b.principal) - Number(a.principal) || collator.compare(a.actor, b.actor) || a.id - b.id,
  actor: (a, b) => collator.compare(a.actor, b.actor) || a.id - b.id,
  personaje: (a, b) => collator.compare(a.personaje, b.personaje) || a.id - b.id,
};

const configListado = {
  filtros: { principal: filtroBooleano },
  ordenes,
  ordenPorDefecto: 'principales',
};

function verificarReglas(peliculaId, datos, idActual) {
  const resto = repartoRepository.porPelicula(peliculaId).filter((miembro) => miembro.id !== idActual);

  if (resto.some((miembro) => normalizar(miembro.actor) === normalizar(datos.actor))) {
    throw new ConflictError(`${datos.actor} ya forma parte del reparto de esta pelicula`, 'ACTOR_DUPLICADO');
  }
  if (datos.principal && resto.filter((miembro) => miembro.principal).length >= MAX_PRINCIPALES) {
    throw new ConflictError(
      `Una pelicula admite hasta ${MAX_PRINCIPALES} papeles principales`,
      'LIMITE_PRINCIPALES',
    );
  }
}

export function obtener(peliculaId, id) {
  const miembro = repartoRepository.buscar(id);
  if (!miembro || miembro.peliculaId !== peliculaId) {
    throw new NotFoundError(`La pelicula ${peliculaId} no tiene el miembro de reparto ${id}`, 'REPARTO_NO_ENCONTRADO');
  }
  return miembro;
}

export function listar(peliculaId, query) {
  const { filtros, comparador, pagina, limite } = leerListado(query, configListado);
  const reparto = repartoRepository
    .porPelicula(peliculaId)
    .filter((miembro) => filtros.principal === undefined || miembro.principal === filtros.principal)
    .sort(comparador);
  return paginar(reparto, pagina, limite);
}

export function crear(peliculaId, datos) {
  verificarReglas(peliculaId, datos);
  return repartoRepository.crear({ peliculaId, ...datos });
}

export function actualizar(peliculaId, id, cambios) {
  const actual = obtener(peliculaId, id);
  verificarReglas(peliculaId, { ...actual, ...cambios }, id);
  return repartoRepository.actualizar(id, cambios);
}

export function eliminar(peliculaId, id) {
  obtener(peliculaId, id);
  repartoRepository.eliminar(id);
}
