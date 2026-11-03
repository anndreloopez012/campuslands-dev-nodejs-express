import { CharacterService } from '../services/character.service.js';

export const getCharacters = (req, res) => {
  try {
    const list = CharacterService.getAllCharacters();
    res.status(200).json({
      ok: true,
      data: list
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener personajes",
      error: error.message
    });
  }
};

export const getCharacterById = (req, res) => {
  try {
    const { id } = req.params;
    const character = CharacterService.getCharacterById(id);

    if (!character) {
      return res.status(404).json({
        ok: false,
        message: `Personaje con ID ${id} no encontrado`
      });
    }

    res.status(200).json({
      ok: true,
      data: character
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
      error: error.message
    });
  }
};

export const createCharacter = (req, res) => {
  try {
    const newCharacter = CharacterService.createCharacter(req.body);
    res.status(201).json({
      ok: true,
      message: "Personaje creado con éxito",
      data: newCharacter
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: error.message
    });
  }
};