export const CATEGORIAS = Object.freeze(['deportivo', 'sedan', 'suv', 'gran_turismo', 'hiperauto']);

export const ORDENES = Object.freeze({
  id: (a, b) => a.id - b.id,
  precio: (a, b) => a.precioUsd - b.precioUsd || a.id - b.id,
  '-precio': (a, b) => b.precioUsd - a.precioUsd || a.id - b.id,
  anio: (a, b) => a.anio - b.anio || a.id - b.id,
  '-anio': (a, b) => b.anio - a.anio || a.id - b.id,
  potencia: (a, b) => a.potenciaHp - b.potenciaHp || a.id - b.id,
  '-potencia': (a, b) => b.potenciaHp - a.potenciaHp || a.id - b.id,
});

export const LISTA_DE_ORDENES = Object.freeze(Object.keys(ORDENES));

export const MONEDAS = Object.freeze({ USD: 1, EUR: 0.92, GTQ: 7.75, MXN: 17.2 });
export const LISTA_DE_MONEDAS = Object.freeze(Object.keys(MONEDAS));

export const PLAZOS = Object.freeze([12, 24, 36, 48, 60]);

export const ANIO_MINIMO = 1990;
export const ANIO_MAXIMO = 2027;
export const PRECIO_MINIMO = 50000;
export const PRECIO_MAXIMO = 10000000;
