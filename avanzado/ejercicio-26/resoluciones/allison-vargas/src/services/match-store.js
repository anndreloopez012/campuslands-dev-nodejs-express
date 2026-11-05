import { createMatch } from '../data/match-factory.js';
import { matchFixtures } from '../data/match-fixtures.js';

export function createMatchStore(fixtures = matchFixtures) {
  const matches = fixtures.map((match) => ({ ...match, players: [...match.players] }));
  let sequence = matches.length + 1;
  return {
    list(map) { return matches.filter((match) => !map || match.map.toLowerCase() === map.toLowerCase()); },
    find(id) { return matches.find((match) => match.id === id) ?? null; },
    create(input) {
      const match = createMatch({ ...input, id: `match-${String(sequence++).padStart(3, '0')}`, playedAt: new Date().toISOString() });
      matches.push(match);
      return match;
    }
  };
}
