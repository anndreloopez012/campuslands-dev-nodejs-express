const armas = [
  { id: 1, nombre: 'AK-47', dano: 36 },
  { id: 2, nombre: 'AWP', dano: 115 },
  { id: 3, nombre: 'Glock', dano: 28 }
];

const estados = {
  200: { nombre: 'OK', descripcion: 'La peticion salio bien' },
  201: { nombre: 'Created', descripcion: 'Se creo un recurso nuevo' },
  204: { nombre: 'No Content', descripcion: 'Salio bien pero no hay contenido que devolver' },
  400: { nombre: 'Bad Request', descripcion: 'Los datos enviados no son validos' },
  401: { nombre: 'Unauthorized', descripcion: 'Falta autenticacion' },
  404: { nombre: 'Not Found', descripcion: 'El recurso no existe' },
  409: { nombre: 'Conflict', descripcion: 'El recurso ya existe o hay un conflicto' },
  500: { nombre: 'Internal Server Error', descripcion: 'Fallo interno del servidor' }
};

export function getArmas() {
  return armas;
}

export function existeArma(nombre) {
  return armas.some((a) => a.nombre.toLowerCase() === nombre.toLowerCase());
}

export function agregarArma(nombre, dano) {
  let nuevoId = 1;

  if (armas.length > 0) {
    nuevoId = armas[armas.length - 1].id + 1;
  }

  const nueva = { id: nuevoId, nombre: nombre, dano: dano };
  armas.push(nueva);
  return nueva;
}

export function borrarArma(id) {
  const posicion = armas.findIndex((a) => a.id === id);

  if (posicion === -1) {
    return null;
  }

  return armas.splice(posicion, 1)[0];
}

export function getEstados() {
  return estados;
}
