export const redondear = (valor) => Math.round(valor * 100) / 100;

export const distancia = (a, b) => redondear(Math.hypot(a.x - b.x, a.y - b.y));

export const dentroDelMapa = (punto, mapa) =>
  punto.x >= 0 && punto.x <= mapa.ancho && punto.y >= 0 && punto.y <= mapa.alto;

export const dentroDeLaZona = (punto, zona) =>
  Math.hypot(punto.x - zona.centro.x, punto.y - zona.centro.y) <= zona.radio;

export function aparicionEnCirculo(cantidad, { centro, radio }) {
  return Array.from({ length: cantidad }, (_, i) => {
    const angulo = (2 * Math.PI * i) / cantidad;
    return {
      x: redondear(centro.x + radio * Math.cos(angulo)),
      y: redondear(centro.y + radio * Math.sin(angulo)),
    };
  });
}
