import { ConflictError, NotFoundError } from '../utils/errors.js';

const porId = (a, b) => a.id - b.id;

export function crearPersonajesService({ repositorio, reloj = () => new Date() }) {
  function obtener(id) {
    const personaje = repositorio.buscar(id);
    if (!personaje) throw new NotFoundError(`No existe el personaje ${id}`, 'PERSONAJE_NO_ENCONTRADO');
    return personaje;
  }

  function listar({ clase, nivelMin, nivelMax, texto } = {}, comparador = porId) {
    const buscado = texto?.toLowerCase();
    return repositorio
      .listar((p) =>
        (clase === undefined || p.clase === clase)
        && (nivelMin === undefined || p.nivel >= nivelMin)
        && (nivelMax === undefined || p.nivel <= nivelMax)
        && (buscado === undefined || p.nombre.toLowerCase().includes(buscado)))
      .sort(comparador);
  }

  function exigirNombreLibre(nombre, propioId) {
    const repetido = repositorio.listar((p) => p.id !== propioId && p.nombre.toLowerCase() === nombre.toLowerCase());
    if (repetido.length) throw new ConflictError(`Ya existe un personaje llamado ${nombre}`, 'NOMBRE_DUPLICADO');
  }

  function crear({ nombre, clase, nivel = 1 }) {
    exigirNombreLibre(nombre);
    return repositorio.crear({ nombre, clase, nivel, creadoEn: reloj().toISOString() });
  }

  function actualizar(id, cambios) {
    obtener(id);
    if (cambios.nombre !== undefined) exigirNombreLibre(cambios.nombre, id);
    return repositorio.actualizar(id, cambios);
  }

  function eliminar(id) {
    obtener(id);
    repositorio.eliminar(id);
  }

  return { obtener, listar, crear, actualizar, eliminar };
}
