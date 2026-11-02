// Fuente única de la documentación: se sirve en /api/docs y se refleja en el README
export const endpointsDocs = [
  { method: 'GET', path: '/api/champions', description: 'Lista campeones. Filtro opcional: ?role=Mid', responses: [200] },
  { method: 'GET', path: '/api/champions/:id', description: 'Obtiene un campeón por id', responses: [200, 404] },
  { method: 'POST', path: '/api/champions', description: 'Crea un campeón. Body: { name, role, difficulty }', responses: [201, 400] },
  { method: 'GET', path: '/api/docs', description: 'Devuelve esta documentación', responses: [200] }
];
