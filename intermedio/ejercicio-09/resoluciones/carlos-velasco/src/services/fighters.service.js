const peleadores = [
  { id: 1, name: 'Kenta Mori', pais: 'JAPON', modalidad: 'kick liviano', victorias: 24, derrotas: 3, peso_kg: 66 },
  { id: 2, name: 'Sara Vale', pais: 'BRASIL', modalidad: 'full contact', victorias: 19, derrotas: 5, peso_kg: 61 },
  { id: 3, name: 'Ivan Petrov', pais: 'BULGARIA', modalidad: 'kick liviano', victorias: 31, derrotas: 2, peso_kg: 71 },
  { id: 4, name: 'Nia Kero', pais: 'JAPON', modalidad: 'low kick', victorias: 15, derrotas: 8, peso_kg: 57 },
  { id: 5, name: 'Diego Arana', pais: 'PERU', modalidad: 'full contact', victorias: 22, derrotas: 4, peso_kg: 75 },
  { id: 6, name: 'Luna Sato', pais: 'JAPON', modalidad: 'low kick', victorias: 27, derrotas: 1, peso_kg: 52 },
  { id: 7, name: 'Miro Kova', pais: 'CROACIA', modalidad: 'kick liviano', victorias: 18, derrotas: 6, peso_kg: 80 },
  { id: 8, name: 'Petra Ruis', pais: 'PERU', modalidad: 'kick liviano', victorias: 12, derrotas: 9, peso_kg: 64 }
];

const modalidadesValidas = ['kick liviano', 'low kick', 'full contact'];

/**
 * Busqueda con paginacion y filtros combinables.
 *
 * Filtros disponibles (opcionales):
 * - nombre: texto parciales sobre el nombre (case-insensitive).
 * - pais: coincidencia exacta.
 * - modalidad: coincidencia exacta.
 * Orden:
 * - orden = 'victorias' -> por victorias descendente; 'nombre' -> alfabeticamente.
 * Paginacion:
 * - page >= 1, limit entre 1 y MAX_LIMIT por seguridad.
 */
function buscarPeleadores({ nombre, pais, modalidad, orden, page = 1, limit = 5 }) {
  const MAX_LIMIT = 20;
  const pagina = Math.max(1, Number.parseInt(page, 10) || 1);
  const tamano = Math.min(MAX_LIMIT, Math.max(1, Number.parseInt(limit, 10) || 5));
  const total = peleadores.length;

  let resultado = [...peleadores];

  if (nombre) {
    const texto = String(nombre).toLowerCase();
    resultado = resultado.filter((p) => p.name.toLowerCase().includes(texto));
  }
  if (pais) {
    resultado = resultado.filter((p) => p.pais === String(pais).toUpperCase());
  }
  if (modalidad) {
    if (!modalidadesValidas.includes(modalidad)) {
      return { error: `La modalidad "${modalidad}" no es valida. Valores: ${modalidadesValidas.join(', ')}` };
    }
    resultado = resultado.filter((p) => p.modalidad === modalidad);
  }

  if (orden === 'victorias') {
    resultado.sort((a, b) => b.victorias - a.victorias);
  } else if (orden === 'nombre') {
    resultado.sort((a, b) => a.name.localeCompare(b.name));
  }

  const filtrados = resultado.length;
  const indiceInicio = (pagina - 1) * tamano;
  const items = resultado.slice(indiceInicio, indiceInicio + tamano);

  return {
    pagina: { page: pagina, limit: tamano, total_items: filtrados, total_paginas: Math.ceil(filtrados / tamano) || 1, total_sin_filtro: total },
    items
  };
}

module.exports = { buscarPeleadores, modalidadesValidas };
