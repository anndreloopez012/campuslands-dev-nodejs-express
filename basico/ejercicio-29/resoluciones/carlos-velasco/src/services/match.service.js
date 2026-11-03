let matches = [
  {
    id: 1,
    homeTeam: "Real Madrid",
    awayTeam: "Barcelona",
    modality: "futbol",
    status: "scheduled"
  },
  {
    id: 2,
    homeTeam: "Inter Sala",
    awayTeam: "Titanes Futsal",
    modality: "futbol-sala",
    status: "scheduled"
  }
];

function getAllMatches() {
  return matches;
}

function createMatch(matchData) {
  const newMatch = {
    id: matches.length > 0 ? matches[matches.length - 1].id + 1 : 1,
    ...matchData,
    status: "scheduled"
  };

  matches.push(newMatch);

  return newMatch;
}

module.exports = {
  getAllMatches,
  createMatch
};