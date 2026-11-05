export const mapName = 'Isolated';
export const zoneRadius = 1000;

export function colapseZone(currentRadius) {
  if (typeof currentRadius !== 'number' || currentRadius <= 0 || isNaN(currentRadius)) {
    throw new Error('El radio actual debe ser mayor a 0');
  }

  const newRadius = Math.round(currentRadius * 0.6);
  return {
    mapa: mapName,
    zonaAnterior: currentRadius,
    nuevaZona: newRadius,
    fase: 'Cierre de zona 2',
    estado: newRadius < 50 ? 'Zona final' : 'Zona activa'
  };
}
