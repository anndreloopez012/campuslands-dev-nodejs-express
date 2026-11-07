const characterService = require("../services/character.service");
const { toV1, toV2 } = require("../adapters/character.adapter");

/**
 * Los endpoints de listado/detalle se declan por version, pero la logica
 * de negocio es compartida: solo cambia el adaptador de salida.
 */
const serializersByVersion = { v1: toV1, v2: toV2 };

function registerVersion(req, res, next) {
  req.apiVersion = String(req.baseUrl.match(/v[12]$/)?.[0] || "desconocida");
  next();
}

function getCharacters(req, res, next) {
  try {
    const serialize = serializersByVersion[req.apiVersion] || toV1;
    const characters = characterService.list();
    res.status(200).json({
      ok: true,
      apiVersion: req.apiVersion,
      count: characters.length,
      data: characters.map(serialize),
    });
  } catch (error) {
    next(error);
  }
}

function getCharacterById(req, res, next) {
  try {
    const serialize = serializersByVersion[req.apiVersion] || toV1;
    const character = characterService.getById(req.params.id);
    res.status(200).json({
      ok: true,
      apiVersion: req.apiVersion,
      data: serialize(character, characterService.powerScore(character)),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { registerVersion, getCharacters, getCharacterById };
