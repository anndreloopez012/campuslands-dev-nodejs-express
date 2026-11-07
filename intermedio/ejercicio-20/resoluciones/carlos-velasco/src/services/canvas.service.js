const { ValidationError, NotFoundError } = require('../errors/app.error');
const { lienzos } = require('../data/lienzos.data');

const estilosValidos = ['lineal', 'pixel', 'libre'];

function listarLienzos() {
  return lienzos;
}

function crearLienzo(datos) {
  const { titulo, estilo, capas } = datos;

  if (!titulo || typeof titulo !== 'string' || titulo.trim().length < 3) {
    throw new ValidationError('El campo "titulo" es obligatorio (minimo 3 caracteres)');
  }
  if (!estilosValidos.includes(estilo)) {
    throw new ValidationError(`El estilo "${estilo}" no es valido. Estilos: ${estilosValidos.join(', ')}`);
  }
  if (!Number.isInteger(capas) || capas < 1 || capas > 128) {
    throw new ValidationError('El campo "capas" debe ser un entero entre 1 y 128');
  }

  const nuevo = { id: lienzos.length + 1, titulo: titulo.trim(), estilo, capas };
  lienzos.push(nuevo);
  return nuevo;
}

function actualizarTitulo(id, datos) {
  const lienzo = lienzos.find((actual) => actual.id === id);
  if (!lienzo) throw new NotFoundError(`El lienzo ${id} no existe`);

  const { titulo } = datos || {};
  if (!titulo || typeof titulo !== 'string' || titulo.trim().length < 3) {
    throw new ValidationError('El campo "titulo" es obligatorio (minimo 3 caracteres)');
  }

  lienzo.titulo = titulo.trim();
  return lienzo;
}

module.exports = { listarLienzos, crearLienzo, actualizarTitulo, estilosValidos };
