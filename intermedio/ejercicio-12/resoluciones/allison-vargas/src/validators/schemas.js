export const SUBGENEROS = ['fantasmas', 'slasher', 'posesion', 'zombis', 'psicologico', 'found-footage', 'monstruos'];
export const CLASIFICACIONES = ['PG-13', 'R', 'NC-17'];

export const esquemaPelicula = {
  titulo: { tipo: 'texto', min: 2, max: 80, requerido: true },
  anio: { tipo: 'entero', min: 1900, max: 2100, requerido: true },
  director: { tipo: 'texto', min: 2, max: 60, requerido: true },
  subgenero: { tipo: 'enum', valores: SUBGENEROS, requerido: true },
  duracionMin: { tipo: 'entero', min: 40, max: 300, requerido: true },
  clasificacion: { tipo: 'enum', valores: CLASIFICACIONES, porDefecto: 'R' },
};

export const esquemaResena = {
  autor: { tipo: 'texto', min: 2, max: 40, requerido: true },
  puntuacion: { tipo: 'entero', min: 1, max: 5, requerido: true },
  comentario: { tipo: 'texto', min: 5, max: 500, requerido: true },
};

export const esquemaReparto = {
  actor: { tipo: 'texto', min: 2, max: 60, requerido: true },
  personaje: { tipo: 'texto', min: 2, max: 60, requerido: true },
  principal: { tipo: 'booleano', porDefecto: false },
};
