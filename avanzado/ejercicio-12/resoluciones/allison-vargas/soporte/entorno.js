import { crearServicios } from '../src/services/index.js';

export const INICIO = new Date('2026-11-05T12:00:00.000Z');

export function crearReloj(inicio = INICIO) {
  let actual = inicio.getTime();
  return {
    reloj: () => new Date(actual),
    avanzar: (ms) => { actual += ms; },
  };
}

export const pausa = (ms) => new Promise((resolver) => { setTimeout(resolver, ms); });

export function sinteticas(cantidad) {
  return Array.from({ length: cantidad }, (_, i) => ({
    id: i + 1,
    titulo: `Pelicula sintetica ${i + 1}`,
    anio: 1980 + (i % 45),
    subgenero: ['slasher', 'gore', 'zombis'][i % 3],
    duracionMin: 80 + (i % 40),
    clasificacion: '+16',
    calificacion: Math.round(((i % 90) / 10) * 10) / 10,
    presupuestoMusd: 1 + (i % 10),
    recaudacionMusd: 2 + (i % 30),
    estreno: `${1980 + (i % 45)}-06-15`,
    pais: 'Chile',
    sinopsis: 'Un relato de terror sintetico para pruebas de volumen. '.repeat(8),
    etiquetas: ['sustos', 'encierro'],
    directorId: 1,
    repartoIds: [1, 2],
  }));
}

export function crearEntorno({ peliculas, alSerializar, reloj } = {}) {
  const tiempo = crearReloj();
  const opciones = { reloj: reloj ?? tiempo.reloj, alSerializar };
  if (peliculas) opciones.peliculas = peliculas;
  return { ...tiempo, servicios: crearServicios(opciones) };
}

export const rechazaCon = (codigo, contexto) => (error) => {
  if (error?.codigo !== codigo) return false;
  if (contexto) {
    for (const [clave, valor] of Object.entries(contexto)) {
      if (error.contexto[clave] !== valor) return false;
    }
  }
  return true;
};

export const NUEVA = {
  titulo: 'Noche en el sotano',
  anio: 2024,
  subgenero: 'gotico',
  duracionMin: 95,
  clasificacion: '+16',
  calificacion: 6.5,
  presupuestoMusd: 2,
  recaudacionMusd: 9.5,
  pais: 'Peru',
  directorId: 1,
  repartoIds: [1, 2],
};
