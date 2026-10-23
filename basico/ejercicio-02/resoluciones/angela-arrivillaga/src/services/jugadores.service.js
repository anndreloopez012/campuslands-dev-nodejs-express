const jugadores = [
  { id: 1, nombre: 'Sombra', arma: 'Rifle', puntos: 120 },
  { id: 2, nombre: 'Viper', arma: 'Pistola', puntos: 95 },
  { id: 3, nombre: 'Jett', arma: 'Francotirador', puntos: 150 }
];

const scripts = [
  { nombre: 'dev', comando: 'npm run dev', descripcion: 'Inicia el servidor con watch' },
  { nombre: 'start', comando: 'npm start', descripcion: 'Inicia el servidor normal' },
  { nombre: 'info', comando: 'npm run info', descripcion: 'Muestra la version de node' },
  { nombre: 'saludo', comando: 'npm run saludo', descripcion: 'Imprime un saludo en consola' }
];

export function getScripts() {
  return scripts;
}

export function buscarJugador(id) {
  return jugadores.find((j) => j.id === id);
}
