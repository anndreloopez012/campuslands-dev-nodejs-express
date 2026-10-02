const autos = [
  { id: 1, marca: 'Rolls-Royce', modelo: 'Phantom', precio: 450000 },
  { id: 2, marca: 'Bentley', modelo: 'Continental GT', precio: 250000 },
  { id: 3, marca: 'Mercedes', modelo: 'Maybach S580', precio: 200000 },
  { id: 4, marca: 'Bentley', modelo: 'Bentayga', precio: 230000 }
];

export function getAutos() {
  return autos;
}

export function buscarPorMarca(marca) {
  return autos.filter((a) => a.marca.toLowerCase() === marca.toLowerCase());
}
