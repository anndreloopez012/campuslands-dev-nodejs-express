export const BASE_RUTAS = '/intermedio/ejercicio-25';

export const CATALOGO_RUTAS = [
  { metodo: 'GET', ruta: '/', descripcion: 'Ruta principal del ejercicio' },
  { metodo: 'GET', ruta: '/rutas', descripcion: 'Catalogo de rutas disponibles' },
  { metodo: 'GET', ruta: '/personajes', descripcion: 'Lista personajes con filtros y paginacion' },
  { metodo: 'POST', ruta: '/personajes', descripcion: 'Crea un personaje' },
  { metodo: 'GET', ruta: '/personajes/ranking', descripcion: 'Ranking por nivel y experiencia' },
  { metodo: 'GET', ruta: '/personajes/:id', descripcion: 'Detalle de un personaje' },
  { metodo: 'PATCH', ruta: '/personajes/:id', descripcion: 'Renombra un personaje' },
  { metodo: 'DELETE', ruta: '/personajes/:id', descripcion: 'Elimina un personaje y su inventario' },
  { metodo: 'GET', ruta: '/personajes/:id/inventario', descripcion: 'Inventario del personaje' },
  { metodo: 'POST', ruta: '/personajes/:id/inventario', descripcion: 'Agrega un item al inventario' },
  { metodo: 'DELETE', ruta: '/personajes/:id/inventario/:itemId', descripcion: 'Quita un item del inventario' },
  { metodo: 'POST', ruta: '/personajes/:id/misiones/:misionId/completar', descripcion: 'Completa una mision y aplica recompensas' },
  { metodo: 'GET', ruta: '/misiones', descripcion: 'Lista misiones con filtros y paginacion' },
  { metodo: 'GET', ruta: '/misiones/:id', descripcion: 'Detalle de una mision' },
];
