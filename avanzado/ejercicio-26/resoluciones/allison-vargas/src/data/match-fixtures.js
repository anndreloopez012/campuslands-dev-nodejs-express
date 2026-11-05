import { createMatch } from './match-factory.js';

export const matchFixtures = Object.freeze([
  Object.freeze(createMatch()),
  Object.freeze(createMatch({ id: 'match-002', map: 'Haven', players: ['Nova', 'Rift'], winner: 'Rift', rounds: 21, playedAt: '2026-01-16T19:30:00.000Z' }))
]);
