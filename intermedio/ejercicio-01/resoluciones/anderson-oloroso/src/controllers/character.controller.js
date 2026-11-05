import * as characterService from '../services/character.service.js';

export const getHealth = (req, res) => {
  return res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'arquitectura por capas'
  });
};

export const listCharacters = (req, res) => {
  try {
    const data = characterService.getAllCharacters();
    return res.status(200).json({
      ok: true,
      total: data.length,
      data
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message
    });
  }
};

export const getCharacter = (req, res) => {
  try {
    const { id } = req.params;
    const data = characterService.getCharacterById(id);
    return res.status(200).json({
      ok: true,
      data
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      ok: false,
      message: error.message
    });
  }
};

export const registerCharacter = (req, res) => {
  try {
    const { nombre, clase, nivel, fuerza, agilidad, inteligencia } = req.body;

    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
      return res.status(400).json({
        ok: false,
        message: 'El nombre del personaje es requerido y debe ser texto no vacío.'
      });
    }

    if (!clase || typeof clase !== 'string') {
      return res.status(400).json({
        ok: false,
        message: 'La clase del personaje es requerida (Guerrero, Mago, Arquero, Clerigo).'
      });
    }

    if (nivel !== undefined && (typeof nivel !== 'number' || nivel < 1 || nivel > 100)) {
      return res.status(400).json({
        ok: false,
        message: 'El nivel debe ser un número entero entre 1 y 100.'
      });
    }

    const nuevo = characterService.createCharacter({
      nombre,
      clase,
      nivel: nivel ? Number(nivel) : 1,
      fuerza: fuerza ? Number(fuerza) : 10,
      agilidad: agilidad ? Number(agilidad) : 10,
      inteligencia: inteligencia ? Number(inteligencia) : 10
    });

    return res.status(201).json({
      ok: true,
      message: 'Personaje RPG creado exitosamente',
      data: nuevo
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      ok: false,
      message: error.message
    });
  }
};
