const teams = [{ id: 1, name: 'Campus FC' }];

exports.findAll = () => teams;
exports.add = (name) => {
  const team = { id: teams.length + 1, name };
  teams.push(team);
  return team;
};
