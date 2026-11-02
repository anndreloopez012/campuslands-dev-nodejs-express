import { teams } from '../data/teams.data.js';

// Capa de acceso a datos: único lugar que toca el arreglo
export const teamsRepository = {
  findAll: () => teams,
  findById: (id) => teams.find((t) => t.id === id),
  create: (data) => {
    const team = { id: Math.max(0, ...teams.map((t) => t.id)) + 1, ...data };
    teams.push(team);
    return team;
  }
};
