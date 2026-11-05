import { ConflictError, NotFoundError } from '../../utils/errors.js';
import { EVENTOS } from '../../constants/dominio.js';

const porId = (a, b) => a.id - b.id;

export function crearJugadoresService({ repositorio, eventos, reloj }) {
  function buscar(id) {
    return repositorio.buscar(id);
  }

  function obtener(id) {
    const jugador = repositorio.buscar(id);
    if (!jugador) throw new NotFoundError(`No existe el jugador ${id}`, 'JUGADOR_NO_ENCONTRADO');
    return jugador;
  }

  function listar({ region, buscar: texto } = {}, comparador = porId) {
    const buscado = texto?.toLowerCase();
    return repositorio
      .listar((j) =>
        (region === undefined || j.region === region)
        && (buscado === undefined || j.alias.toLowerCase().includes(buscado)))
      .sort(comparador);
  }

  async function crear({ alias, region }) {
    const repetido = repositorio.listar((j) => j.alias.toLowerCase() === alias.toLowerCase());
    if (repetido.length) throw new ConflictError(`Ya existe un jugador con el alias ${alias}`, 'ALIAS_DUPLICADO');
    const jugador = repositorio.crear({ alias, region, creadoEn: reloj().toISOString() });
    await eventos.emitir(EVENTOS.JUGADOR_CREADO, { jugador });
    return jugador;
  }

  return { buscar, obtener, listar, crear, contar: () => repositorio.listar().length };
}
