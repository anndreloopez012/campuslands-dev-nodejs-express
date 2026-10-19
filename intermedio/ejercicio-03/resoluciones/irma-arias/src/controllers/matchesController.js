const matches = [{ id: 1, teamA: 'Dragones', teamB: 'Titanes', score: '2-1' }];

export function listMatches(_request, response) {
  response.json({ data: matches });
}

export function getMatch(request, response) {
  const match = matches.find((item) => item.id === Number(request.params.id));
  if (!match) return response.status(404).json({ error: 'Partida no encontrada.' });
  return response.json({ data: match });
}
