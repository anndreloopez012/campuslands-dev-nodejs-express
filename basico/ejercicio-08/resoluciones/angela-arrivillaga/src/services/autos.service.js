const autos = [
  { id: 1, marca: 'Bugatti', modelo: 'Chiron', velocidadMax: 420 },
  { id: 2, marca: 'Koenigsegg', modelo: 'Jesko', velocidadMax: 480 },
  { id: 3, marca: 'Pagani', modelo: 'Huayra', velocidadMax: 370 }
];

export function buscarAuto(id) {
  return autos.find((a) => a.id === id);
}
