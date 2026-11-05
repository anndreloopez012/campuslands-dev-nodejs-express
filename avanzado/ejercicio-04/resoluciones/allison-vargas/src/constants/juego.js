export const ESTADOS = Object.freeze({
  ABIERTA: 'abierta',
  EN_CURSO: 'en_curso',
  TERMINADA: 'terminada',
});

export const MAPA = Object.freeze({
  ancho: 100,
  alto: 100,
  radioAparicion: 40,
  centro: Object.freeze({ x: 50, y: 50 }),
});

export const JUGADOR = Object.freeze({
  vidaMaxima: 100,
  escudoMaximo: 50,
  municionInicial: 6,
  municionMaxima: 60,
  espaciosInventario: 4,
  pasoMaximo: 15,
  alcanceRecoger: 3,
  nickMin: 3,
  nickMax: 16,
});

export const ARMAS = Object.freeze({
  pistola: Object.freeze({ alcance: 30, dano: 20 }),
  rifle: Object.freeze({ alcance: 60, dano: 30 }),
});

export const CONSUMIBLES = Object.freeze({
  botiquin: Object.freeze({ cura: 40 }),
  escudo: Object.freeze({ puntos: 25 }),
  municion: Object.freeze({ balas: 12 }),
});

export const TIPOS_OBJETO = Object.freeze([...Object.keys(ARMAS), ...Object.keys(CONSUMIBLES)]);

export const ZONA = Object.freeze({
  radios: Object.freeze([50, 35, 22, 12, 5]),
  danoBase: 10,
});

export const PARTIDA = Object.freeze({
  capacidadMin: 2,
  capacidadMax: 20,
  minimoPorDefecto: 2,
  nombreMin: 3,
  nombreMax: 40,
});

export const ACCIONES_POR_LOTE = 20;
export const TIPOS_ACCION = Object.freeze(['mover', 'recoger', 'disparar', 'curar']);
