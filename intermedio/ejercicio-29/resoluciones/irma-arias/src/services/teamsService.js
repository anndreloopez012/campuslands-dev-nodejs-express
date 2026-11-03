const teams = [{ id: 1, name: 'Estrella', sport: 'fútbol sala' }];

export function getTeams() {
  return teams;
}

export function addTeam(name) {
  const team = { id: teams.length + 1, name, sport: 'fútbol sala' };
  teams.push(team);
  return team;
}
