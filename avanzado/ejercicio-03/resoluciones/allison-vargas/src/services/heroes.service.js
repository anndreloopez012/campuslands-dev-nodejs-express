import { ConflictError, NotFoundError } from '../utils/errors.js';

const porId = (a, b) => a.id - b.id;

const sinMetadatos = ({ id, creadoEn, ...heroe }) => heroe;

export function crearHeroesService({ repositorio, esquema, reloj }) {
  function buscar(id) {
    return repositorio.buscar(id);
  }

  function obtener(id) {
    const heroe = repositorio.buscar(id);
    if (!heroe) throw new NotFoundError(`No existe el heroe ${id}`, 'HEROE_NO_ENCONTRADO');
    return heroe;
  }

  function listar({ rol, dificultad, buscar: texto } = {}, comparador = porId) {
    const buscado = texto?.toLowerCase();
    return repositorio
      .listar((h) =>
        (rol === undefined || h.rol === rol)
        && (dificultad === undefined || h.dificultad === dificultad)
        && (buscado === undefined || h.nombre.toLowerCase().includes(buscado)))
      .sort(comparador);
  }

  function exigirNombreLibre(nombre, propioId) {
    const repetido = repositorio.listar((h) => h.id !== propioId && h.nombre.toLowerCase() === nombre.toLowerCase());
    if (repetido.length) throw new ConflictError(`Ya existe un heroe llamado ${nombre}`, 'NOMBRE_DUPLICADO');
  }

  function crear(datos) {
    exigirNombreLibre(datos.nombre);
    return repositorio.crear({ ...datos, creadoEn: reloj().toISOString() });
  }

  function actualizar(id, cambios) {
    const actual = obtener(id);
    const fusion = {
      ...sinMetadatos(actual),
      ...cambios,
      estadisticas: { ...actual.estadisticas, ...cambios.estadisticas },
    };
    const completo = esquema.parsear(fusion, { en: 'cuerpo' });
    exigirNombreLibre(completo.nombre, id);
    return repositorio.actualizar(id, completo);
  }

  return { buscar, obtener, listar, crear, actualizar, contar: () => repositorio.listar().length };
}
