const pistas = [
  { id: 1, titulo: 'Cafe Con Acento', artista: 'Tierra Val', album: 'Maquina Antigua', duracion_seg: 224 },
  { id: 2, titulo: 'Slicewear', artista: 'Liquid Room', album: 'Neon Basement', duracion_seg: 312 },
  { id: 3, titulo: 'Vuelo Del [babel]', artista: 'Tierra Val', album: 'Maquina Antigua', duracion_seg: 268 },
  { id: 4, titulo: 'Late Shift', artista: 'Lake Echo', album: 'Blue Hour', duracion_seg: 197 },
  { id: 5, titulo: 'Aftersun', artista: 'Solaria', album: 'Blue Hour', duracion_seg: 241 }
];

/**
 * Normaliza texto para busqueda insensible:
 * - a minusculas
 * - sin acentos (decomposition + remocion de marcas diacriticas)
 * - colapsa espacios multiples
 */
function normalizar(texto) {
  return String(texto)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

const CAMPOS_BUSCABLES = ['titulo', 'artista', 'album'];

function buscarPistas(query, { campo, limite = 10 } = {}) {
  const consulta = normalizar(query || '');

  if (consulta.length === 0) {
    return { error: 'El parametro "q" es obligatorio' };
  }
  if (campo && !CAMPOS_BUSCABLES.includes(campo)) {
    return { error: `El campo "${campo}" no es buscable. Campos: ${CAMPOS_BUSCABLES.join(', ')}` };
  }

  const terminos = consulta.split(' ').filter((termino) => termino.length > 0);
  const campos = campo ? [campo] : CAMPOS_BUSCABLES;

  const coincidencias = [];
  for (const pista of pistas) {
    const camposCoincidentes = [];
    for (const campoActual of campos) {
      const texto = normalizar(pista[campoActual]);
      const coincidenTodos = terminos.every((termino) => texto.includes(termino));
      if (coincidenTodos) camposCoincidentes.push(campoActual);
    }

    if (camposCoincidentes.length > 0) {
      // Puntaje: entre mas campos coinciden, mayor prioridad.
      coincidencias.push({ pista, camposCoincidentes, puntaje: camposCoincidentes.length });
    }
  }

  coincidencias.sort((a, b) => b.puntaje - a.puntaje || a.pista.id - b.pista.id);

  const maximo = Number.parseInt(limite, 10);
  const lista = coincidencias.slice(0, Number.isInteger(maximo) && maximo > 0 ? Math.min(maximo, 50) : 10);

  return {
    data: lista.map((coincidencia) => ({
      ...coincidencia.pista,
      match_en: coincidencia.camposCoincidentes
    }))
  };
}

module.exports = { buscarPistas, normalizar, CAMPOS_BUSCABLES };
