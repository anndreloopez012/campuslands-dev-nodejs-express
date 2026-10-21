import { teamRepository } from '../repositories/team.repository.js';

export class TeamService {
  static async listTeams() {
    return await teamRepository.findAll();
  }

  static async getTeam(id) {
    const team = await teamRepository.findById(id);
    if (!team) {
      const err = new Error(`El equipo con ID ${id} no existe`);
      err.statusCode = 404;
      throw err;
    }
    return team;
  }

  static async registerTeam(data) {
    const { name, city, division = "Primera", titles = 0 } = data;

    if (!name || !city) {
      const err = new Error("El nombre y la ciudad del equipo son requeridos");
      err.statusCode = 400;
      throw err;
    }

    const existingName = await teamRepository.findByName(name);
    if (existingName) {
      const err = new Error(`Ya existe un equipo registrado con el nombre '${name}'`);
      err.statusCode = 409;
      throw err;
    }

    return await teamRepository.create({
      name: name.trim(),
      city: city.trim(),
      division,
      titles: Number(titles)
    });
  }

  static async removeTeam(id) {
    await this.getTeam(id); // Valida existencia previa
    await teamRepository.delete(id);
    return true;
  }
}