const lootZones = [
  { id: 1, nombre: 'Base Militar Sosnovka', nivelPeligro: 'Extremo', calidadLoot: 'Nivel Militar 3' },
  { id: 2, nombre: 'Pochinki', nivelPeligro: 'Alto', calidadLoot: 'Medio-Alto' },
  { id: 3, nombre: 'Hospital de Georgopol', nivelPeligro: 'Medio', calidadLoot: 'Médico Avanzado' }
];

let loadouts = [];

export const getHealth = (_req, res) => {
  return res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'coleccion de ejemplos HTTP',
    collectionFile: 'requests.http'
  });
};

export const listLootZones = (_req, res) => {
  return res.status(200).json({
    ok: true,
    total: lootZones.length,
    data: lootZones
  });
};

export const getLootZoneById = (req, res) => {
  const zone = lootZones.find((z) => z.id === Number(req.params.id));
  if (!zone) {
    return res.status(404).json({
      ok: false,
      message: `Zona de botín con ID ${req.params.id} no existe en el mapa.`
    });
  }
  return res.status(200).json({ ok: true, data: zone });
};

export const createLoadout = (req, res) => {
  const { playerName, armaPrincipal, armaSecundaria, nivelCasco, nivelChaleco } = req.body;
  if (!playerName || !armaPrincipal || !nivelCasco) {
    return res.status(400).json({
      ok: false,
      message: 'Los campos playerName, armaPrincipal y nivelCasco son requeridos.'
    });
  }

  const loadout = {
    id: loadouts.length + 1,
    playerName,
    armaPrincipal,
    armaSecundaria: armaSecundaria || 'Ninguna',
    nivelCasco: Number(nivelCasco),
    nivelChaleco: nivelChaleco ? Number(nivelChaleco) : 1,
    timestamp: new Date().toISOString()
  };

  loadouts.push(loadout);
  return res.status(201).json({
    ok: true,
    message: 'Equipamiento registrado con éxito',
    data: loadout
  });
};
