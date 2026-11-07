const { ValidationError, NotFoundError } = require('../errors/app.error');

const peliculas = [
  { id: 1, titulo: 'La Casa Solariega', anio: 1979, duracion_min: 96 },
  { id: 2, titulo: 'Terror en el Lago', anio: 2004, duracion_min: 84 },
  { id: 3, titulo: 'El Sotano', anio: 2019, duracion_min: 103 }
];

const resenas = [
  { id: 1, peliculaId: 1, autor: 'cinefilo_77', puntaje: 8, comentario: 'Claustrofobia bien ejecutada.' },
  { id: 2, peliculaId: 1, autor: 'nocheMN', puntaje: 6, comentario: 'Buena atmósfera, final previsible.' },
  { id: 3, peliculaId: 3, autor: 'gorefan', puntaje: 9, comentario: 'El mejor climax practicalo del cine.' }
];

function listarPeliculas() {
  return [...peliculas];
}

function obtenerPelicula(id) {
  const pelicula = peliculas.find((actual) => actual.id === id);
  if (!pelicula) throw new NotFoundError(`La pelicula con id ${id} no existe`);
  return pelicula;
}

function crearPelicula(datos) {
  const { titulo, anio, duracion_min } = datos;

  if (!titulo || typeof titulo !== 'string' || titulo.trim().length < 3) {
    throw new ValidationError('El campo "titulo" es obligatorio y debe tener al menos 3 caracteres');
  }
  if (!Number.isInteger(anio) || anio < 1920 || anio > 2100) {
    throw new ValidationError('El campo "anio" debe ser un entero entre 1920 y 2100');
  }
  if (!Number.isInteger(duracion_min) || duracion_min <= 0) {
    throw new ValidationError('El campo "duracion_min" debe ser un entero mayor a 0');
  }

  const nueva = { id: peliculas.length + 1, titulo: titulo.trim(), anio, duracion_min };
  peliculas.push(nueva);
  return nueva;
}

function listarResenas(peliculaId) {
  obtenerPelicula(peliculaId);
  return resenas.filter((resena) => resena.peliculaId === peliculaId);
}

function obtenerResena(peliculaId, resenaId) {
  obtenerPelicula(peliculaId);
  const resena = resenas.find((actual) => actual.id === resenaId && actual.peliculaId === peliculaId);
  if (!resena) {
    throw new NotFoundError(`La resena ${resenaId} no existe para la pelicula ${peliculaId}`);
  }
  return resena;
}

function crearResena(peliculaId, datos) {
  obtenerPelicula(peliculaId);
  const { autor, puntaje, comentario } = datos;

  if (!autor || typeof autor !== 'string' || autor.trim().length < 3) {
    throw new ValidationError('El campo "autor" es obligatorio y debe tener al menos 3 caracteres');
  }
  if (!Number.isInteger(puntaje) || puntaje < 1 || puntaje > 10) {
    throw new ValidationError('El campo "puntaje" debe ser un entero entre 1 y 10');
  }
  if (!comentario || typeof comentario !== 'string' || comentario.trim().length < 10) {
    throw new ValidationError('El campo "comentario" es obligatorio y debe tener al menos 10 caracteres');
  }

  const nueva = {
    id: resenas.length + 1,
    peliculaId,
    autor: autor.trim(),
    puntaje,
    comentario: comentario.trim()
  };
  resenas.push(nueva);
  return nueva;
}

function eliminarResena(peliculaId, resenaId) {
  obtenerResena(peliculaId, resenaId);
  const indice = resenas.findIndex((actual) => actual.id === resenaId);
  resenas.splice(indice, 1);
}

module.exports = { listarPeliculas, obtenerPelicula, crearPelicula, listarResenas, obtenerResena, crearResena, eliminarResena };
