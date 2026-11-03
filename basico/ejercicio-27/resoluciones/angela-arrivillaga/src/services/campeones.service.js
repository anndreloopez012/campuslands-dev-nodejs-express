const campeones = [
  { id: 1, nombre: 'Jinx', rol: 'ADC' },
  { id: 2, nombre: 'Yasuo', rol: 'Mid' },
  { id: 3, nombre: 'Thresh', rol: 'Support' }
];

export function getCampeones() {
  return campeones;
}

export function buscarCampeon(id) {
  return campeones.find((c) => c.id === id);
}
