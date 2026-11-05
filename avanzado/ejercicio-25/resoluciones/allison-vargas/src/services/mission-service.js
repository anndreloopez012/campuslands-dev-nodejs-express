import { randomUUID } from 'node:crypto';

export class MissionService {
  #missions = [];

  list(status) {
    if (status && !['pending', 'completed'].includes(status)) return [];
    return this.#missions.filter((mission) => !status || mission.status === status);
  }

  create(input) {
    const title = typeof input?.title === 'string' ? input.title.trim() : '';
    const region = typeof input?.region === 'string' ? input.region.trim() : '';
    const level = Number(input?.level);
    const reward = Number(input?.reward);
    if (!title || title.length > 100) return { error: 'El título debe tener entre 1 y 100 caracteres' };
    if (!region || region.length > 80) return { error: 'La región debe tener entre 1 y 80 caracteres' };
    if (!Number.isInteger(level) || level < 1 || level > 100) return { error: 'El nivel debe ser un entero entre 1 y 100' };
    if (!Number.isInteger(reward) || reward < 0) return { error: 'La recompensa debe ser un entero no negativo' };
    const mission = { id: randomUUID(), title, region, level, reward, status: 'pending' };
    this.#missions.push(mission);
    return { data: mission };
  }

  complete(id) {
    const mission = this.#missions.find((entry) => entry.id === id);
    if (!mission) return { error: 'NOT_FOUND' };
    if (mission.status === 'completed') return { error: 'ALREADY_COMPLETED' };
    mission.status = 'completed';
    return { data: mission };
  }
}
