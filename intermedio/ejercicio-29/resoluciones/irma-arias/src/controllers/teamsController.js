import { addTeam, getTeams } from '../services/teamsService.js';

export function listTeams(_request, response) {
  response.json({ data: getTeams() });
}

export function createTeam(request, response) {
  const name = request.body?.name;
  if (typeof name !== 'string' || !name.trim()) return response.status(400).json({ error: 'El nombre es obligatorio.' });
  return response.status(201).json({ data: addTeam(name.trim()) });
}
