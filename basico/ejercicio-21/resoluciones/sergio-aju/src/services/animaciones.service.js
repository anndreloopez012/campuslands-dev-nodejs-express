const animaciones = [
  {
    id: 1,
    nombre: 'Robot futurista',
    tipo: '3D'
  },
  {
    id: 2,
    nombre: 'Personaje animado',
    tipo: '3D'
  }
];

let siguienteId = 3;

export function listarAnimaciones() {
  return animaciones;
}

export function guardarAnimacion(nombre, tipo) {
  const nuevaAnimacion = {
    id: siguienteId++,
    nombre,
    tipo
  };

  animaciones.push(nuevaAnimacion);

  return nuevaAnimacion;
}