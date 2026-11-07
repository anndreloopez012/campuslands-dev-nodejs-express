const matches = [];
let nextMatchId = 1;

function list() {
  return matches;
}

function save(match) {
  matches.push(match);
  return match;
}

module.exports = { list, save, nextId: () => nextMatchId++ };
