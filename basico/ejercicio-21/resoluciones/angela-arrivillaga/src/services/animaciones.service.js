const animaciones = [
  { id: 1, nombre: 'Caminata de robot', frames: 120, fps: 24, software: 'Blender' },
  { id: 2, nombre: 'Explosion de particulas', frames: 240, fps: 30, software: 'Maya' },
  { id: 3, nombre: 'Personaje saltando', frames: 60, fps: 24, software: 'Blender' }
];

export function getAnimaciones() {
  return animaciones;
}

export function buscarAnimacion(id) {
  return animaciones.find((a) => a.id === id);
}
