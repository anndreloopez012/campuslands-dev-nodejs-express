import { MemoryRepository } from './memory.repository.js';
import { loadJson } from '../utils/loadJson.js';

class AsignacionesRepository extends MemoryRepository {
  porMision(misionId) {
    return this.listar((asignacion) => asignacion.misionId === misionId);
  }

  porTripulante(tripulanteId) {
    return this.listar((asignacion) => asignacion.tripulanteId === tripulanteId);
  }

  buscarPar(misionId, tripulanteId) {
    return this.listar(
      (asignacion) => asignacion.misionId === misionId && asignacion.tripulanteId === tripulanteId,
    )[0] ?? null;
  }

  eliminarPorMision(misionId) {
    return this.eliminarDonde((asignacion) => asignacion.misionId === misionId);
  }

  eliminarPorTripulante(tripulanteId) {
    return this.eliminarDonde((asignacion) => asignacion.tripulanteId === tripulanteId);
  }
}

export const asignacionesRepository = new AsignacionesRepository(loadJson('asignaciones.json'));
