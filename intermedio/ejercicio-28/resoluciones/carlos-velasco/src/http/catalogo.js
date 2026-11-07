/**
 * Catalogo de la coleccion: cada ejemplo declara el metodo, la ruta y
 * el codigo HTTP que demuestra, con su explicacion.
 * La API implementa EXACTAMENTE este listado.
 */
const ejemplos = [
  { id: 'health', metodo: 'GET', ruta: '/health', codigo: 200, titulo: 'OK', explicacion: 'El servidor esta vivo y responde con body.' },
  { id: 'inventario', metodo: 'GET', ruta: '/inventario', codigo: 200, titulo: 'GET con lista', explicacion: 'Consulta sin efectos secundarios.' },
  { id: 'loot', metodo: 'POST', ruta: '/loot', codigo: 201, titulo: 'Created', explicacion: 'POST crea un recurso y devuelve su referencia.' },
  { id: 'inscripcion', metodo: 'POST', ruta: '/torneo/inscripcion', codigo: 202, titulo: 'Accepted', explicacion: 'La peticion se acepto pero se procesara despues (cola).' },
  { id: 'ping', metodo: 'HEAD', ruta: '/ping', codigo: 200, titulo: 'HEAD', explicacion: 'Mismos headers que GET, sin body.' },
  { id: 'opciones', metodo: 'OPTIONS', ruta: '/opciones', codigo: 204, titulo: 'OPTIONS + No Content', explicacion: 'Describe lo que se puede hacer con el recurso.' },
  { id: 'actualizar-total', metodo: 'PUT', ruta: '/inventario/1', codigo: 200, titulo: 'PUT reemplaza el recurso completo', explicacion: 'Requiere todos los campos del recurso.' },
  { id: 'actualizar-parcial', metodo: 'PATCH', ruta: '/inventario/1', codigo: 200, titulo: 'PATCH cambia un campo', explicacion: 'Actualizacion parcial (ej: cantidad del loot).' },
  { id: 'descartar', metodo: 'DELETE', ruta: '/inventario/1', codigo: 204, titulo: 'DELETE sin cuerpo', explicacion: 'Eliminado exitoso: 204 nunca envie body.' },
  { id: 'vacio', metodo: 'GET', ruta: '/caja-vacia', codigo: 200, titulo: '200 con lista vacia', explicacion: 'No encontrado NO es error de consultas exitosas sin resultados.' },
  { id: 'no-autorizado', metodo: 'GET', ruta: '/zona-restringida', codigo: 401, titulo: 'Unauthorized', explicacion: 'Falta autenticacion (header Authorization).' },
  { id: 'sin-permiso', metodo: 'GET', ruta: '/sala-vip', codigo: 403, titulo: 'Forbidden', explicacion: 'Autenticado pero sin permiso para el recurso.' },
  { id: 'quien', metodo: 'GET', ruta: '/area/99', codigo: 404, titulo: 'Not Found', explicacion: 'El recurso no existe.' },
  { id: 'conflicto', metodo: 'POST', ruta: '/torneo/registro', codigo: 409, titulo: 'Conflict', explicacion: 'La operacion entra en conflicto con el estado actual.' },
  { id: 'tipo-incorrecto', metodo: 'POST', ruta: '/loot', codigo: 415, titulo: 'Unsupported Media Type', explicacion: 'El Content-Type enviado no es aceptado.' },
  { id: 'limite', metodo: 'GET', ruta: '/torre', codigo: 429, titulo: 'Too Many Requests', explicacion: 'Fuera de cuota: solo 2 consultas por minuto (simulado con contador manual).' }
];

module.exports = { ejemplos };
