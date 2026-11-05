import { ConflictError, NotFoundError } from '../utils/errors.js';
import { MAX_ESPACIOS } from '../constants/rpg.js';

export function crearInventarioService({ repositorio, personajes }) {
  const delPersonaje = (personajeId) =>
    repositorio.listar((item) => item.personajeId === personajeId).sort((a, b) => a.id - b.id);

  function listar(personajeId) {
    personajes.obtener(personajeId);
    const items = delPersonaje(personajeId);
    return {
      personajeId,
      items,
      espacios: { usados: items.length, maximo: MAX_ESPACIOS },
      valorTotal: items.reduce((suma, item) => suma + item.valor * item.cantidad, 0),
    };
  }

  function agregar(personajeId, datos) {
    personajes.obtener(personajeId);
    if (delPersonaje(personajeId).length >= MAX_ESPACIOS) {
      throw new ConflictError('El inventario esta lleno', 'INVENTARIO_LLENO');
    }
    return repositorio.crear({ personajeId, ...datos });
  }

  function quitar(personajeId, itemId) {
    personajes.obtener(personajeId);
    const item = repositorio.buscar(itemId);
    if (!item || item.personajeId !== personajeId) {
      throw new NotFoundError(`El personaje ${personajeId} no tiene el item ${itemId}`, 'ITEM_NO_ENCONTRADO');
    }
    repositorio.eliminar(itemId);
    return item;
  }

  return { listar, agregar, quitar };
}
