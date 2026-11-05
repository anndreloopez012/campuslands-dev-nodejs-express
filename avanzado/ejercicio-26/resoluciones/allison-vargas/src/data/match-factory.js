export function createMatch(overrides = {}) {
  return {
    id: overrides.id ?? 'match-001',
    map: overrides.map ?? 'Ascent',
    players: overrides.players ?? ['Player One', 'Player Two'],
    winner: overrides.winner ?? 'Player One',
    rounds: overrides.rounds ?? 13,
    playedAt: overrides.playedAt ?? '2026-01-15T18:00:00.000Z'
  };
}
