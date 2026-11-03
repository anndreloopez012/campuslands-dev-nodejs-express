const motos = [{ id: 1, model: 'Trail 250', year: 2023 }];

exports.findAll = () => motos;
exports.add = ({ model, year }) => {
  const moto = { id: motos.length + 1, model, year };
  motos.push(moto);
  return moto;
};
