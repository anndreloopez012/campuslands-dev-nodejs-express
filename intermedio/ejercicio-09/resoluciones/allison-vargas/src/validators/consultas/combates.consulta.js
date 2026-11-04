export const combatesConsulta = {
  limiteDefault: 10,
  limiteMax: 50,
  ordenDefault: 'fecha:desc',
  ordenables: ['fecha', 'rounds', 'evento', 'resultado'],
  busqueda: ['evento'],
  filtros: {
    resultado: { tipo: 'enum', campo: 'resultado', valores: ['victoria', 'derrota', 'empate'] },
    metodo: { tipo: 'enum', campo: 'metodo', valores: ['KO', 'TKO', 'decision'] },
    evento: { tipo: 'texto', campo: 'evento' },
    desde: { tipo: 'fecha', campo: 'fecha', op: 'gte' },
    hasta: { tipo: 'fecha', campo: 'fecha', op: 'lte' },
    peleadorId: { tipo: 'entero', campo: 'peleadorId', min: 1 },
  },
};
