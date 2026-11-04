export const ordenPartidos = {
  maxCriterios: 4,
  limiteDefault: 10,
  limiteMax: 50,
  porDefecto: 'fecha:desc',
  campos: {
    id: { tipo: 'numero' },
    fecha: { tipo: 'fecha' },
    torneo: { tipo: 'texto' },
    ronda: { tipo: 'enum', valores: ['grupos', 'octavos', 'cuartos', 'semifinal', 'final'] },
    ganador: { tipo: 'texto', leer: (partido) => partido.ganador.nombre },
    perdedor: { tipo: 'texto', leer: (partido) => partido.perdedor.nombre },
    setsPerdedor: { tipo: 'numero' },
    duracionMin: { tipo: 'numero' },
    puntosTotales: { tipo: 'numero' },
  },
  vistas: {
    recientes: 'fecha:desc',
    antiguos: 'fecha:asc',
    largos: 'duracionMin:desc,puntosTotales:desc',
    finales: 'ronda:desc,fecha:desc',
    renidos: 'setsPerdedor:desc,puntosTotales:desc',
  },
};
