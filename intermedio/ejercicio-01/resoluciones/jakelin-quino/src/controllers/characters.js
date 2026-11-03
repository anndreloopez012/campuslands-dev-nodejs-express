const characterService = require('../services/characters');

exports.list = (_req, res) => res.json(characterService.list());
