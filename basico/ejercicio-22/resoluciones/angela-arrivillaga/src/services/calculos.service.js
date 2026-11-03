export function calcularArea(ancho, largo) {
  return ancho * largo;
}

export function calcularVolumen(ancho, largo, alto) {
  return ancho * largo * alto;
}

export function calcularCosto(ancho, largo, precioPorMetro) {
  const area = calcularArea(ancho, largo);
  return Number((area * precioPorMetro).toFixed(2));
}
