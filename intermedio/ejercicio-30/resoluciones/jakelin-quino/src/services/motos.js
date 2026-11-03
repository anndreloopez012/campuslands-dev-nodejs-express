const repository = require('../repositories/motos');

exports.list = () => repository.findAll();
exports.create = (moto) => repository.add(moto);
