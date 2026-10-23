const sneakers = [
  { id: 1, marca: 'Nike', modelo: 'Air Force 1', precio: 110 },
  { id: 2, marca: 'Adidas', modelo: 'Samba', precio: 100 },
  { id: 3, marca: 'Jordan', modelo: 'Air Jordan 1', precio: 180 }
];

export function getSneakers() {
  return sneakers;
}

export function buscarSneaker(id) {
  return sneakers.find((s) => s.id === id);
}
