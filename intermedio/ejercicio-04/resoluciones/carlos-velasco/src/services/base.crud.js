const { AppError, ValidationError, NotFoundError } = require('../errors/app.error');

/**
 * Fabrica de CRUD en memoria reutilizable.
 * Cualquier servicio de la API puede construirse a partir de esta base,
 * inyectando el nombre del recurso y su funcion de validacion.
 */
function crearCrudReutilizable({ recurso, items, validar }) {
  function listar() {
    return items;
  }

  function obtener(id) {
    const item = items.find((actual) => actual.id === id);
    if (!item) throw new NotFoundError(`El ${recurso} con id ${id} no existe`);
    return item;
  }

  function crear(datos) {
    validar(datos);
    const nuevo = { id: items.length + 1, ...datos };
    items.push(nuevo);
    return nuevo;
  }

  function actualizar(id, datos) {
    const item = obtener(id);
    validar({ ...item, ...datos });
    Object.assign(item, datos);
    return item;
  }

  function eliminar(id) {
    const indice = items.findIndex((actual) => actual.id === id);
    if (indice === -1) throw new NotFoundError(`El ${recurso} con id ${id} no existe`);
    items.splice(indice, 1);
  }

  return { listar, obtener, crear, actualizar, eliminar };
}

module.exports = { crearCrudReutilizable, AppError, ValidationError, NotFoundError };
