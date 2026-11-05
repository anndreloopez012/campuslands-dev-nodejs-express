export const VERSIONES = [
  {
    version: 'v1',
    numero: 1,
    deprecadaDesde: '2026-07-01T00:00:00.000Z',
    retiroPrevisto: '2027-03-31T23:59:59.000Z',
    sucesora: 'v2',
    cambiosRotos: [],
  },
  {
    version: 'v2',
    numero: 2,
    deprecadaDesde: null,
    retiroPrevisto: null,
    sucesora: null,
    cambiosRotos: [
      'El campo hp se reemplaza por atributos.vida y se agregan atributos.mana y atributos.fuerza',
      'Los listados se paginan: la respuesta trae meta y links en vez de un total suelto',
      'Los errores usan application/problem+json (RFC 9457) en vez de { ok, message }',
      'Las respuestas exitosas ya no llevan el campo ok',
      'Se agregan PATCH y DELETE de personajes y el catalogo GET /clases',
    ],
  },
];
