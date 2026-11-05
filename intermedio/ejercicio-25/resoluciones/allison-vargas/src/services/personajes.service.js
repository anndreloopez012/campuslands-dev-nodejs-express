import { ConflictError, NotFoundError } from '../utils/errors.js';
import { paginar } from '../utils/paginacion.js';
import { aplicarExperiencia, estadisticas } from '../utils/progreso.js';
import { leerListado, filtroEnum, filtroEntero } from '../validators/consulta.js';
import { NIVEL_MAX, NOMBRES_CLASES, ORO_INICIAL } from '../constants/rpg.js';

const porNivel = (a, b) => b.nivel - a.nivel || b.experiencia - a.experiencia || a.id - b.id;

const configListado = {
  filtros: {
    clase: filtroEnum(NOMBRES_CLASES),
    nivelMin: filtroEntero(1, NIVEL_MAX),
    buscar: (texto, error) => {
      const valor = texto.toLowerCase();
      if (valor.length < 1 || valor.length > 20) {
        error('debe tener entre 1 y 20 caracteres');
        return undefined;
      }
      return valor;
    },
  },
  ordenes: {
    id: (a, b) => a.id - b.id,
    nombre: (a, b) => a.nombre.localeCompare(b.nombre),
    nivel: porNivel,
  },
  ordenPorDefecto: 'id',
};

const configRanking = {
  ordenes: { nivel: porNivel },
  ordenPorDefecto: 'nivel',
  limiteDefault: 5,
  limiteMax: 10,
};

export function crearPersonajesService({ repositorio, inventarioRepositorio, reloj = () => new Date() }) {
  function obtener(id) {
    const personaje = repositorio.buscar(id);
    if (!personaje) throw new NotFoundError(`No existe el personaje ${id}`, 'PERSONAJE_NO_ENCONTRADO');
    return personaje;
  }

  function validarNombreLibre(nombre, idActual) {
    const repetido = repositorio.listar((p) => p.id !== idActual && p.nombre.toLowerCase() === nombre.toLowerCase());
    if (repetido.length) throw new ConflictError(`Ya existe un personaje llamado ${nombre}`, 'NOMBRE_DUPLICADO');
  }

  function listar(query) {
    const consulta = leerListado(query, configListado);
    const { clase, nivelMin, buscar } = consulta.filtros;
    const filtrados = repositorio
      .listar((p) =>
        (clase === undefined || p.clase === clase)
        && (nivelMin === undefined || p.nivel >= nivelMin)
        && (buscar === undefined || p.nombre.toLowerCase().includes(buscar)))
      .sort(consulta.comparador);
    return paginar(filtrados, consulta.pagina, consulta.limite);
  }

  function ranking(query) {
    const consulta = leerListado(query, configRanking);
    return paginar(repositorio.listar().sort(consulta.comparador), consulta.pagina, consulta.limite);
  }

  function crear({ nombre, clase }) {
    validarNombreLibre(nombre);
    return repositorio.crear({
      nombre,
      clase,
      nivel: 1,
      experiencia: 0,
      ...estadisticas(clase, 1),
      oro: ORO_INICIAL,
      misionesCompletadas: [],
      creadoEn: reloj().toISOString(),
    });
  }

  function renombrar(id, { nombre }) {
    obtener(id);
    validarNombreLibre(nombre, id);
    return repositorio.actualizar(id, { nombre });
  }

  function eliminar(id) {
    const personaje = obtener(id);
    repositorio.eliminar(id);
    inventarioRepositorio.eliminarDonde((item) => item.personajeId === id);
    return personaje;
  }

  function registrarMision(id, mision) {
    const personaje = obtener(id);
    const progreso = aplicarExperiencia(personaje, mision.recompensaXp);
    const actualizado = repositorio.actualizar(id, {
      nivel: progreso.nivel,
      experiencia: progreso.experiencia,
      ...estadisticas(personaje.clase, progreso.nivel),
      oro: personaje.oro + mision.recompensaOro,
      misionesCompletadas: [...personaje.misionesCompletadas, mision.id],
    });
    return { personaje: actualizado, nivelesGanados: progreso.nivelesGanados };
  }

  return { obtener, listar, ranking, crear, renombrar, eliminar, registrarMision };
}
