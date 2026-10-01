let matches = [
  {
    id: 1,
    player: "Shadow",
    location: "Island",
    players: 42,
    status: "waiting"
  },
  {
    id: 2,
    player: "Hunter",
    location: "Desert",
    players: 35,
    status: "waiting"
  }
];

function getAllMatches() {
  return matches;
}

function createMatch(matchData) {
  const newMatch = {
    id: matches.length > 0 ? matches[matches.length - 1].id + 1 : 1,
    ...matchData,
    status: "waiting"
  };

  matches.push(newMatch);

  return newMatch;
}

module.exports = {
  getAllMatches,
  createMatch
};