// Cada arma cuesta puntos; un equipamiento (loadout) no puede superar el presupuesto.
const PRIMARY = { assault: 5, sniper: 6, smg: 4, shotgun: 4 };
const SECONDARY = { pistol: 2, revolver: 3, 'machine-pistol': 2 };
const BUDGET = 8;

const loadouts = [{ id: 1, name: 'Rush A', primary: 'smg', secondary: 'pistol', cost: 6 }];

function serviceError(status, message, details) {
  const error = new Error(message);
  error.status = status;
  if (details) error.details = details;
  return error;
}

const list = () => loadouts;

function get(id) {
  const loadout = loadouts.find((item) => item.id === id);
  if (!loadout) throw serviceError(404, `El loadout ${id} no existe`);
  return loadout;
}

function create(data) {
  // 400: la peticion esta MAL FORMADA (faltan campos o tienen tipo incorrecto)
  const malformed = [];
  if (typeof data?.name !== 'string' || data.name.trim().length < 2 || data.name.trim().length > 30) {
    malformed.push('name debe ser texto de 2 a 30 caracteres');
  }
  if (typeof data?.primary !== 'string') malformed.push('primary debe ser texto');
  if (typeof data?.secondary !== 'string') malformed.push('secondary debe ser texto');
  if (malformed.length > 0) throw serviceError(400, 'Peticion mal formada', malformed);

  // 422: la peticion esta BIEN FORMADA pero viola una regla de negocio
  const rules = [];
  if (!(data.primary in PRIMARY)) rules.push(`primary desconocida (validas: ${Object.keys(PRIMARY).join(', ')})`);
  if (!(data.secondary in SECONDARY)) rules.push(`secondary desconocida (validas: ${Object.keys(SECONDARY).join(', ')})`);
  if (rules.length === 0) {
    const cost = PRIMARY[data.primary] + SECONDARY[data.secondary];
    if (cost > BUDGET) rules.push(`el equipamiento cuesta ${cost} puntos y el presupuesto es ${BUDGET}`);
  }
  if (rules.length > 0) throw serviceError(422, 'El equipamiento no cumple las reglas del juego', rules);

  // 409: choca con el estado actual del servidor
  const name = data.name.trim();
  if (loadouts.some((item) => item.name.toLowerCase() === name.toLowerCase())) {
    throw serviceError(409, `Ya existe un loadout llamado "${name}"`);
  }

  const loadout = {
    id: loadouts.reduce((max, item) => Math.max(max, item.id), 0) + 1,
    name,
    primary: data.primary,
    secondary: data.secondary,
    cost: PRIMARY[data.primary] + SECONDARY[data.secondary],
  };
  loadouts.push(loadout);
  return loadout;
}

function remove(id) {
  const index = loadouts.findIndex((item) => item.id === id);
  if (index === -1) throw serviceError(404, `El loadout ${id} no existe`);
  loadouts.splice(index, 1);
}

module.exports = { BUDGET, list, get, create, remove };
