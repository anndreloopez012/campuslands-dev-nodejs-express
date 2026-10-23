const teams = [{ id: 1, name: 'Halcones' }];

export function findAllTeams() {
  return teams;
}

export function saveTeam(name) {
  const team = { id: teams.length + 1, name };
  teams.push(team);
  return team;
}
