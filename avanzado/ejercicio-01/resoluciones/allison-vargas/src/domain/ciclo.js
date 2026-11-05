export function estadoDeVersion(definicion, ahora) {
  const instante = ahora.getTime();
  if (definicion.retiroPrevisto && instante > Date.parse(definicion.retiroPrevisto)) return 'retirada';
  if (definicion.deprecadaDesde && instante >= Date.parse(definicion.deprecadaDesde)) return 'deprecada';
  return 'estable';
}
