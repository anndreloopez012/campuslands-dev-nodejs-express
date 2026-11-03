const TYPES = ['futbol', 'futbol-sala'];

const teams = [
  { id: 1, name: 'Cobras FC', type: 'futbol', city: 'Guatemala', founded: 1998 },
  { id: 2, name: 'Rayos Sala', type: 'futbol-sala', city: 'Antigua', founded: 2010 },
  { id: 3, name: 'Titanes', type: 'futbol', city: 'Quetzaltenango', founded: 2005 },
];

function serviceError(status, message, details) {
  const error = new Error(message);
  error.status = status;
  if (details) error.details = details;
  return error;
}

const list = (type) => teams.filter((team) => !type || team.type === type);

function get(id) {
  const team = teams.find((item) => item.id === id);
  if (!team) throw serviceError(404, `El equipo ${id} no existe`);
  return team;
}

function create(data) {
  const details = [];
  if (typeof data?.name !== 'string' || data.name.trim().length < 2) details.push('name debe tener al menos 2 caracteres');
  if (!TYPES.includes(data?.type)) details.push(`type debe ser uno de: ${TYPES.join(', ')}`);
  if (typeof data?.city !== 'string' || data.city.trim() === '') details.push('city es obligatorio');
  if (!Number.isInteger(data?.founded) || data.founded < 1850 || data.founded > new Date().getFullYear()) {
    details.push('founded debe ser un anio valido');
  }
  if (details.length > 0) throw serviceError(400, 'Datos invalidos', details);

  const name = data.name.trim();
  if (teams.some((team) => team.name.toLowerCase() === name.toLowerCase())) {
    throw serviceError(409, `Ya existe un equipo llamado "${name}"`);
  }
  const team = {
    id: teams.reduce((max, item) => Math.max(max, item.id), 0) + 1,
    name,
    type: data.type,
    city: data.city.trim(),
    founded: data.founded,
  };
  teams.push(team);
  return team;
}

module.exports = { TYPES, list, get, create };
