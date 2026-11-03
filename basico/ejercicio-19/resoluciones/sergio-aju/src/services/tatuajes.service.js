const tatuajes = [
  {
    id: 1,
    estilo: 'realista',
    zona: 'brazo'
  },
  {
    id: 2,
    estilo: 'tribal',
    zona: 'espalda'
  },
  {
    id: 3,
    estilo: 'realista',
    zona: 'pierna'
  }
];

export function buscarPorId(id) {
  return tatuajes.find(tatuaje => tatuaje.id === Number(id));
}

export function buscarPorEstilo(estilo) {
  if (!estilo) {
    return tatuajes;
  }

  return tatuajes.filter(
    tatuaje => tatuaje.estilo.toLowerCase() === estilo.toLowerCase()
  );
}