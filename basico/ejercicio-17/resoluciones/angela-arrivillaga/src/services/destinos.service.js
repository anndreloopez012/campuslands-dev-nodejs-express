const destinos = [
  { id: 1, ciudad: 'Paris', pais: 'Francia', popular: true },
  { id: 2, ciudad: 'Antigua Guatemala', pais: 'Guatemala', popular: true },
  { id: 3, ciudad: 'Kioto', pais: 'Japon', popular: false },
  { id: 4, ciudad: 'Roma', pais: 'Italia', popular: true }
];

export function getDestinos() {
  return destinos;
}

export function getPopulares() {
  return destinos.filter((d) => d.popular === true);
}

export function getPaises() {
  const paises = [];

  for (let i = 0; i < destinos.length; i++) {
    if (!paises.includes(destinos[i].pais)) {
      paises.push(destinos[i].pais);
    }
  }

  return paises;
}

export function buscarDestino(id) {
  return destinos.find((d) => d.id === id);
}
