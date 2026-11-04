export const CATEGORIAS = [
  'peso mosca',
  'peso gallo',
  'peso pluma',
  'peso ligero',
  'peso welter',
  'peso medio',
  'peso pesado',
];

export const peleadoresConsulta = {
  limiteDefault: 10,
  limiteMax: 50,
  ordenDefault: 'nombre:asc',
  ordenables: ['nombre', 'edad', 'victorias', 'derrotas', 'kos', 'categoria', 'pais'],
  busqueda: ['nombre', 'apodo'],
  filtros: {
    categoria: { tipo: 'enum', campo: 'categoria', valores: CATEGORIAS },
    pais: { tipo: 'texto', campo: 'pais' },
    activo: { tipo: 'booleano', campo: 'activo' },
    edadMin: { tipo: 'entero', campo: 'edad', op: 'gte', min: 16, max: 60 },
    edadMax: { tipo: 'entero', campo: 'edad', op: 'lte', min: 16, max: 60 },
    victoriasMin: { tipo: 'entero', campo: 'victorias', op: 'gte', min: 0 },
    kosMin: { tipo: 'entero', campo: 'kos', op: 'gte', min: 0 },
  },
};
