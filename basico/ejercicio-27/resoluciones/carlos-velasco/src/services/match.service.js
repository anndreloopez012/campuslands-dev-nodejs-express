let matches = [
  {
    id: 1,
    teamA: "Dragons",
    teamB: "Titans",
    map: "Summoners Rift",
    status: "scheduled"
  },
  {
    id: 2,
    teamA: "Phoenix",
    teamB: "Wolves",
    map: "Summoners Rift",
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