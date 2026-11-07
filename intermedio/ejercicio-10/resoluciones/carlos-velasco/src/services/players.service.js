const jugadores = [
  { id: 1, name: 'Ren Huang', puntos: 1985, campeonatos: 14, pais: 'CHINA' },
  { id: 2, name: 'Tim Watt', puntos: 1640, campeonatos: 7, pais: 'ALEMANIA' },
  { id: 3, name: 'Maya Solis', puntos: 1815, campeonatos: 10, pais: 'ARGENTINA' },
  { id: 4, name: 'Lin Bo', puntos: 1902, campeonatos: 12, pais: 'CHINA' },
  { id: 5, name: 'Sofia Delu', puntos: 1544, campeonatos: 4, pais: 'ARGENTINA' },
  { id: 6, name: 'Anna Piv', puntos: 1720, campeonatos: 9, pais: 'ALEMANIA' }
];

const camposOrdenables = {
  puntos: (jugador) => jugador.puntos,
  campeonatos: (jugador) => jugador.campeonatos,
  name: (jugador) => jugador.name.toLowerCase(),
  pais: (jugador) => jugador.pais
};

const direccionesValidas = ['asc', 'desc'];

/**
 * Ordena sobre la lista de jugadores.
 * El campo debe existir en camposOrdenables: si no, devuelve error controlado.
 */
function listarJugadores({ ordenar = 'puntos', direccion = 'desc', pais }) {
  if (!camposOrdenables[ordenar]) {
    return { error: `El campo "${ordenar}" no es ordenable. Campos disponibles: ${Object.keys(camposOrdenables).join(', ')}` };
  }
  if (!direccionesValidas.includes(direccion)) {
    return { error: `La direccion "${direccion}" no es valida. Valores: ${direccionesValidas.join(', ')}` };
  }

  let resultado = [...jugadores];
  if (pais) {
    const filtro = String(pais).toUpperCase();
    resultado = resultado.filter((jugador) => jugador.pais === filtro);
  }

  const consultor = camposOrdenables[ordenar];
  const factor = direccion === 'asc' ? 1 : -1;
  resultado.sort((a, b) => {
    const valorA = consultor(a);
    const valorB = consultor(b);
    if (valorA < valorB) return -1 * factor;
    if (valorA > valorB) return factor;
    return a.id - b.id; // desempate estable por id
  });

  return { data: resultado };
}

module.exports = { listarJugadores, camposOrdenables };
