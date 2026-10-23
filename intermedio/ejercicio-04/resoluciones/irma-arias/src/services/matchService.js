export function createMatchSummary(players, zone) {
  return { players, zone, estimatedSurvivors: Math.max(1, players - zone * 4) };
}
