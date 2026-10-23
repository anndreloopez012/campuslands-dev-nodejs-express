let id = 1;

export function guardarParacaidista(nombre, nivel) {
  return {
    id: id++,
    nombre,
    nivel
  };
}