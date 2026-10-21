export class TeamRepository {
  constructor() {
    this.storage = new Map();
    this.currentId = 1;
    this.seed();
  }

  seed() {
    this.create({ name: "Halcones Futsal", city: "Bucaramanga", division: "Primera", titles: 3 });
    this.create({ name: "Leones Sala", city: "Medellín", division: "Primera", titles: 5 });
  }

  async findAll() {
    return Array.from(this.storage.values());
  }

  async findById(id) {
    return this.storage.get(Number(id)) || null;
  }

  async findByName(name) {
    const all = await this.findAll();
    return all.find(t => t.name.toLowerCase() === name.toLowerCase()) || null;
  }

  async create(teamData) {
    const id = this.currentId++;
    const newTeam = {
      id,
      ...teamData,
      createdAt: new Date().toISOString()
    };
    this.storage.set(id, newTeam);
    return newTeam;
  }

  async update(id, updates) {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updatedTeam = {
      ...existing,
      ...updates,
      id: existing.id, // Prevenir mutación de ID
      updatedAt: new Date().toISOString()
    };

    this.storage.set(existing.id, updatedTeam);
    return updatedTeam;
  }

  async delete(id) {
    const exists = this.storage.has(Number(id));
    if (!exists) return false;
    return this.storage.delete(Number(id));
  }
}

// Instancia única (Singleton) para mantener el estado en memoria durante la ejecución
export const teamRepository = new TeamRepository();