export const heroeValido = (cambios = {}) => ({
  nombre: '  Rayo   Veloz ',
  rol: 'asesino',
  dificultad: 3,
  estadisticas: { vida: 1700, ataque: 90, armadura: 30 },
  habilidades: [
    { tecla: 'Q', nombre: 'Corte', enfriamiento: 5, costoMana: 0 },
    { tecla: 'W', nombre: 'Salto', enfriamiento: 9.5, costoMana: 0 },
    { tecla: 'E', nombre: 'Humo', enfriamiento: 14, costoMana: 0 },
    { tecla: 'R', nombre: 'Tormenta', enfriamiento: 80, costoMana: 0 },
  ],
  etiquetas: [' Rapido ', 'AGIL'],
  ...cambios,
});

export const equipoValido = (cambios = {}) => ({
  nombre: '  Furia   Austral ',
  tag: ' fau ',
  region: 'LATAM',
  fundado: '2022-05-10',
  jugadores: [
    { nick: 'Arco', rol: 'top' },
    { nick: 'Brujo', rol: 'jungla', capitan: true },
    { nick: 'Cometa', rol: 'medio' },
    { nick: 'Dardo', rol: 'tirador' },
    { nick: 'Escudo', rol: 'soporte' },
  ],
  ...cambios,
});

export const draftValido = (cambios = {}) => ({
  azul: 1,
  rojo: 2,
  programadaPara: '2026-12-01T18:30:00Z',
  acciones: [
    { tipo: 'ban', equipo: 'azul', heroe: 4 },
    { tipo: 'ban', equipo: 'rojo', heroe: 3 },
    { tipo: 'pick', equipo: 'azul', heroe: 1, jugador: 'cazador' },
    { tipo: 'pick', equipo: 'rojo', heroe: 2, jugador: 'Solaris' },
  ],
  ...cambios,
});

export const resumenDeErrores = (resultado) => resultado.errores.map((e) => `${e.ruta}:${e.codigo}`);
