// El repositorio se inyecta, así en las pruebas se reemplaza por un mock
export const createWeaponsService = (repository) => ({
  getStrongest: () => {
    const all = repository.findAll();
    if (all.length === 0) throw new Error('No hay armas registradas');
    return all.reduce((best, w) => (w.damage > best.damage ? w : best));
  },

  getDps: (id) => {
    const weapon = repository.findById(id);
    if (!weapon) throw new Error('Arma no encontrada');
    return { name: weapon.name, dps: Math.round(weapon.damage * weapon.fireRate * 100) / 100 };
  }
});
