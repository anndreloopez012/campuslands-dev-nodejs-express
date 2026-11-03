const characterService = require("../services/character.service");

function getAllCharacters(req, res) {
  const characters = characterService.getAll();

  return res.status(200).json({
    ok: true,
    data: characters
  });
}

function getCharacterById(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      ok: false,
      message: "El ID debe ser un número entero positivo"
    });
  }

  const character = characterService.getById(id);

  if (!character) {
    return res.status(404).json({
      ok: false,
      message: "Personaje RPG no encontrado"
    });
  }

  return res.status(200).json({
    ok: true,
    data: character
  });
}

function createCharacter(req, res) {
  const { name, class: characterClass, level } = req.body;

  if (!name || !characterClass || level === undefined) {
    return res.status(400).json({
      ok: false,
      message: "Los campos name, class y level son obligatorios"
    });
  }

  if (
    typeof name !== "string" ||
    typeof characterClass !== "string" ||
    !Number.isInteger(level)
  ) {
    return res.status(400).json({
      ok: false,
      message: "name y class deben ser texto y level debe ser un número entero"
    });
  }

  if (level < 1) {
    return res.status(400).json({
      ok: false,
      message: "El nivel debe ser mayor o igual a 1"
    });
  }

  const newCharacter = characterService.create({
    name: name.trim(),
    class: characterClass.trim(),
    level
  });

  return res.status(201).json({
    ok: true,
    message: "Personaje RPG creado correctamente",
    data: newCharacter
  });
}

function updateCharacter(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      ok: false,
      message: "El ID debe ser un número entero positivo"
    });
  }

  const { name, class: characterClass, level } = req.body;

  if (!name || !characterClass || level === undefined) {
    return res.status(400).json({
      ok: false,
      message: "Los campos name, class y level son obligatorios"
    });
  }

  if (
    typeof name !== "string" ||
    typeof characterClass !== "string" ||
    !Number.isInteger(level)
  ) {
    return res.status(400).json({
      ok: false,
      message: "name y class deben ser texto y level debe ser un número entero"
    });
  }

  if (level < 1) {
    return res.status(400).json({
      ok: false,
      message: "El nivel debe ser mayor o igual a 1"
    });
  }

  const updatedCharacter = characterService.update(id, {
    name: name.trim(),
    class: characterClass.trim(),
    level
  });

  if (!updatedCharacter) {
    return res.status(404).json({
      ok: false,
      message: "Personaje RPG no encontrado"
    });
  }

  return res.status(200).json({
    ok: true,
    message: "Personaje RPG actualizado correctamente",
    data: updatedCharacter
  });
}

function deleteCharacter(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      ok: false,
      message: "El ID debe ser un número entero positivo"
    });
  }

  const deleted = characterService.remove(id);

  if (!deleted) {
    return res.status(404).json({
      ok: false,
      message: "Personaje RPG no encontrado"
    });
  }

  return res.status(204).send();
}

module.exports = {
  getAllCharacters,
  getCharacterById,
  createCharacter,
  updateCharacter,
  deleteCharacter
};