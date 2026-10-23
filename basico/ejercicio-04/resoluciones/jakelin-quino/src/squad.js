export const squad = {
  name: 'Zona Final',
  game: 'Battle Royale',
  members: ['Astra', 'Bolt', 'Ciro', 'Duna']
};

export function getDropMessage(location) {
  return `${squad.name} aterriza en ${location} con ${squad.members.length} jugadores.`;
}