import { ConflictError, NotFoundError, UnprocessableError } from '../utils/errors.js';
import { paginar } from '../utils/paginacion.js';
import { leerListado, filtroEnum, filtroEntero } from '../validators/consulta.js';
import { DIFICULTADES, NIVEL_MAX } from '../constants/rpg.js';

const configListado = {
  filtros: {
    dificultad: filtroEnum(DIFICULTADES),
    nivel: filtroEntero(1, NIVEL_MAX),
  },
  ordenes: {
    id: (a, b) => a.id - b.id,
    nivel: (a, b) => a.nivelMinimo - b.nivelMinimo || a.id - b.id,
    oro: (a, b) => b.recompensaOro - a.recompensaOro || a.id - b.id,
  },
  ordenPorDefecto: 'id',
};

export function crearMisionesService({ repositorio, personajes }) {
  function obtener(id) {
    const mision = repositorio.buscar(id);
    if (!mision) throw new NotFoundError(`No existe la mision ${id}`, 'MISION_NO_ENCONTRADA');
    return mision;
  }

  function listar(query) {
    const consulta = leerListado(query, configListado);
    const { dificultad, nivel } = consulta.filtros;
    const filtradas = repositorio
      .listar((m) =>
        (dificultad === undefined || m.dificultad === dificultad)
        && (nivel === undefined || m.nivelMinimo <= nivel))
      .sort(consulta.comparador);
    return paginar(filtradas, consulta.pagina, consulta.limite);
  }

  function completar(personajeId, misionId) {
    const personaje = personajes.obtener(personajeId);
    const mision = obtener(misionId);

    if (personaje.misionesCompletadas.includes(mision.id)) {
      throw new ConflictError('El personaje ya completo esta mision', 'MISION_YA_COMPLETADA');
    }
    if (personaje.nivel < mision.nivelMinimo) {
      throw new UnprocessableError(
        `La mision requiere nivel ${mision.nivelMinimo} y el personaje es nivel ${personaje.nivel}`,
        'NIVEL_INSUFICIENTE',
      );
    }

    const { personaje: actualizado, nivelesGanados } = personajes.registrarMision(personajeId, mision);
    return {
      personaje: actualizado,
      recompensa: { xp: mision.recompensaXp, oro: mision.recompensaOro },
      nivelesGanados,
    };
  }

  return { obtener, listar, completar };
}
