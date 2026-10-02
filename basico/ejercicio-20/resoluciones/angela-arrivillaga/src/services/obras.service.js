const obras = [
  { id: 1, titulo: 'Atardecer en pixeles', tecnica: 'Pixel art', ancho: 1920, alto: 1080 },
  { id: 2, titulo: 'Robot sonriente', tecnica: 'Vectorial', ancho: 1000, alto: 1000 }
];

export function getObras() {
  return obras;
}

export function agregarObra(titulo, tecnica, ancho, alto) {
  const nueva = {
    id: obras.length + 1,
    titulo: titulo,
    tecnica: tecnica,
    ancho: ancho,
    alto: alto
  };

  obras.push(nueva);
  return nueva;
}
