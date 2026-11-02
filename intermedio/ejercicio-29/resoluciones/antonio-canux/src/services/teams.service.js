import { teamsRepository } from '../repositories/teams.repository.js';
import { AppError } from '../utils/app-error.js';

// Capa de negocio: reglas y validaciones, sin conocer req ni res
export const teamsService = {
  list: (sport) => {
    const all = teamsRepository.findAll();
    return sport ? all.filter((t) => t.sport.toLowerCase() === sport.toLowerCase()) : all;
  },

  getById: (id) => {
    const team = teamsRepository.findById(id);
    if (!team) throw new AppError('Equipo no encontrado', 404);
    return team;
  },

  create: ({ name, sport, city }) => {
    if (!name || !city || !['Fútbol', 'Futsal'].includes(sport)) {
      throw new AppError('Se requieren name, city y sport (Fútbol o Futsal)', 400);
    }
    return teamsRepository.create({ name, sport, city });
  }
};
