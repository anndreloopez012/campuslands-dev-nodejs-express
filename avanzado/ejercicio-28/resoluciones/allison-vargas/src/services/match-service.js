import { randomUUID } from 'node:crypto';

export function createMatchService() {
  const matches = [];
  return {
    list() { return [...matches]; },
    create(input) {
      const arena = typeof input?.arena === 'string' ? input.arena.trim() : '';
      const teams = input?.teams;
      if (!arena || arena.length > 80) return { error: 'La arena debe tener entre 1 y 80 caracteres' };
      if (!Array.isArray(teams) || teams.length !== 2 || teams.some((team) => typeof team !== 'string' || !team.trim()) || teams[0].trim() === teams[1].trim()) return { error: 'Se requieren dos equipos distintos' };
      if (!teams.includes(input.winner)) return { error: 'El ganador debe pertenecer al encuentro' };
      const match = { id: randomUUID(), arena, teams: teams.map((team) => team.trim()), winner: input.winner, createdAt: new Date().toISOString() };
      matches.push(match);
      return { data: match };
    }
  };
}
