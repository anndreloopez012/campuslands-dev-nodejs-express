const jugadores = [
  { id: 1, nombre: 'Ma Long', pais: 'China' },
  { id: 2, nombre: 'Fan Zhendong', pais: 'China' },
  { id: 3, nombre: 'Tomokazu Harimoto', pais: 'Japon' }
];

const partidos = [
  { id: 1, jugadorA: 'Ma Long', jugadorB: 'Fan Zhendong', ganador: 'Ma Long' },
  { id: 2, jugadorA: 'Harimoto', jugadorB: 'Ma Long', ganador: 'Harimoto' }
];

function esperar(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function obtenerJugadores() {
  await esperar(300);
  return jugadores;
}

export async function obtenerPartido(id) {
  await esperar(200);

  const partido = partidos.find((p) => p.id === id);

  if (!partido) {
    throw new Error('Partido no encontrado');
  }

  return partido;
}

export async function obtenerResumen() {
  const listaJugadores = await obtenerJugadores();
  const listaPartidos = await obtenerPartido(1);

  return {
    totalJugadores: listaJugadores.length,
    primerPartido: listaPartidos
  };
}
