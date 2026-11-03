const repository = require('../repositories/teams');

exports.list = () => repository.findAll();
exports.create = (name) => repository.add(name);
