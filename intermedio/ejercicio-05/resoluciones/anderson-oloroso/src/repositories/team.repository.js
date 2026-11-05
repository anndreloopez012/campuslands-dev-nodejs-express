// Implementación del patrón Repositorio en memoria
class TeamRepository {
  constructor() {
    this.teams = new Map([
      [
        1,
        {
          id: 1,
          nombre: 'Real Madrid F.C.',
          modalidad: 'Fútbol 11',
          estadio: 'Santiago Bernabéu',
          titulosLiga: 36,
          jugadoresRegistrados: 25
        }
      ],
      [
        2,
        {
          id: 2,
          nombre: 'Movistar Inter FS',
          modalidad: 'Futsal',
          estadio: 'Pabellón Jorge Garbajosa',
          titulosLiga: 14,
          jugadoresRegistrados: 14
        }
      ],
      [
        3,
        {
          id: 3,
          nombre: 'FC Barcelona Futsal',
          modalidad: 'Futsal',
          estadio: 'Palau Blaugrana',
          titulosLiga: 7,
          jugadoresRegistrados: 15
        }
      ]
    ]);
  }

  async findAll(filter = {}) {
    let result = Array.from(this.teams.values());
    if (filter.modalidad) {
      result = result.filter(
        (t) => t.modalidad.toLowerCase() === filter.modalidad.toLowerCase()
      );
    }
    return result;
  }

  async findById(id) {
    return this.teams.get(Number(id)) || null;
  }

  async create(teamData) {
    const id = this.teams.size > 0 ? Math.max(...this.teams.keys()) + 1 : 1;
    const newTeam = { id, ...teamData };
    this.teams.set(id, newTeam);
    return newTeam;
  }

  async update(id, updateData) {
    const numId = Number(id);
    const existing = this.teams.get(numId);
    if (!existing) return null;

    const updatedTeam = { ...existing, ...updateData, id: numId };
    this.teams.set(numId, updatedTeam);
    return updatedTeam;
  }

  async delete(id) {
    const numId = Number(id);
    const exists = this.teams.has(numId);
    if (!exists) return false;
    this.teams.delete(numId);
    return true;
  }
}

export const teamRepository = new TeamRepository();
