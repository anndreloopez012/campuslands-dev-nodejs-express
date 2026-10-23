const artistas = [
  { id: 1, nombre: 'Daniel' },
  { id: 2, nombre: 'Sofia' }
];

const tatuajes = [
  { id: 1, nombre: 'Dragon', estilo: 'japones', artistaId: 1, precio: 300 },
  { id: 2, nombre: 'Rosa', estilo: 'realista', artistaId: 2, precio: 150 },
  { id: 3, nombre: 'Ancla', estilo: 'tradicional', artistaId: 1, precio: 80 },
  { id: 4, nombre: 'Lobo', estilo: 'realista', artistaId: 2, precio: 250 }
];

export function filtrarTatuajes(estilo, precioMax) {
  let resultado = tatuajes;

  if (estilo) {
    resultado = resultado.filter((t) => t.estilo === estilo.toLowerCase());
  }

  if (precioMax !== undefined) {
    resultado = resultado.filter((t) => t.precio <= precioMax);
  }

  return resultado;
}

export function buscarTatuaje(id) {
  return tatuajes.find((t) => t.id === id);
}

export function buscarArtista(id) {
  return artistas.find((a) => a.id === id);
}

export function tatuajesDeArtista(id) {
  return tatuajes.filter((t) => t.artistaId === id);
}
