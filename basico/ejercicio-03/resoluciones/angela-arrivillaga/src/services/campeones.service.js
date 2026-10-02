const campeones = [
  { id: 1, nombre: 'Ahri', rol: 'Mid' },
  { id: 2, nombre: 'Garen', rol: 'Top' },
  { id: 3, nombre: 'Lux', rol: 'Support' }
];

function getCampeones() {
  return campeones;
}

function buscarCampeon(id) {
  return campeones.find((c) => c.id === id);
}

module.exports = { getCampeones, buscarCampeon };
