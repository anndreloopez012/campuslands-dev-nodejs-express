let agents = [
  { id: 1, name: 'Jett', role: 'Duelist', origin: 'Corea del Sur', difficulty: 'Alta' },
  { id: 2, name: 'Sova', role: 'Initiator', origin: 'Rusia', difficulty: 'Media' },
  { id: 3, name: 'Omen', role: 'Controller', origin: 'Desconocido', difficulty: 'Media' },
  { id: 4, name: 'Killjoy', role: 'Sentinel', origin: 'Alemania', difficulty: 'Baja' }
];

let weapons = [
  { id: 1, name: 'Vandal', category: 'Rifle', price: 2900, headshotDamage: 160 },
  { id: 2, name: 'Phantom', category: 'Rifle', price: 2900, headshotDamage: 156 },
  { id: 3, name: 'Operator', category: 'Sniper', price: 4700, headshotDamage: 255 },
  { id: 4, name: 'Spectre', category: 'SMG', price: 1600, headshotDamage: 78 }
];

let matches = [
  {
    id: 1,
    map: 'Ascent',
    agent: 'Jett',
    weapon: 'Vandal',
    kills: 24,
    deaths: 12,
    result: 'Victoria'
  }
];

export const getAgents = () => agents;

export const createAgent = ({ name, role, origin, difficulty }) => {
  const rolesValidos = ['Duelist', 'Initiator', 'Controller', 'Sentinel'];
  if (!rolesValidos.includes(role)) {
    const err = new Error(`Rol inválido. Roles válidos: ${rolesValidos.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }
  const id = agents.length > 0 ? Math.max(...agents.map((a) => a.id)) + 1 : 1;
  const newAgent = { id, name, role, origin: origin || 'Global', difficulty: difficulty || 'Media' };
  agents.push(newAgent);
  return newAgent;
};

export const getWeapons = () => weapons;

export const getMatches = () => matches;

export const createMatch = ({ map, agent, weapon, kills, deaths }) => {
  if (kills < 0 || deaths < 0) {
    const err = new Error('Las bajas y muertes deben ser valores positivos.');
    err.statusCode = 400;
    throw err;
  }
  const id = matches.length > 0 ? Math.max(...matches.map((m) => m.id)) + 1 : 1;
  const kd = (kills / Math.max(deaths, 1)).toFixed(2);
  const result = Number(kd) >= 1.0 ? 'Victoria' : 'Derrota';

  const newMatch = {
    id,
    map,
    agent,
    weapon,
    kills,
    deaths,
    kdRatio: Number(kd),
    result
  };
  matches.push(newMatch);
  return newMatch;
};
