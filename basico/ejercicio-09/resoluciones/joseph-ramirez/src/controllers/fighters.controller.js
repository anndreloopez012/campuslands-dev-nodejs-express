const fightersService = require("../services/fighters.service");

async function getFighters(req, res) {
  try {
    const fighters = await fightersService.getAllFighters();

    res.status(200).json({
      ok: true,
      message: "Peleadores obtenidos correctamente",
      total: fighters.length,
      data: fighters
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      message: "Error al leer los peleadores"
    });
  }
}

async function getFighterById(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        ok: false,
        message: "El ID debe ser un numero entero positivo"
      });
    }

    const fighter = await fightersService.getFighterById(id);

    if (!fighter) {
      return res.status(404).json({
        ok: false,
        message: "Peleador no encontrado"
      });
    }

    res.status(200).json({
      ok: true,
      message: "Peleador encontrado correctamente",
      data: fighter
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      message: "Error al buscar el peleador"
    });
  }
}

async function createFighter(req, res) {
  try {
    const {
      nombre,
      edad,
      categoria,
      victorias,
      derrotas
    } = req.body;

    if (
      !nombre ||
      !categoria ||
      edad === undefined ||
      victorias === undefined ||
      derrotas === undefined
    ) {
      return res.status(400).json({
        ok: false,
        message: "Todos los campos son obligatorios"
      });
    }

    if (
      typeof nombre !== "string" ||
      typeof categoria !== "string"
    ) {
      return res.status(400).json({
        ok: false,
        message: "Nombre y categoria deben ser texto"
      });
    }

    if (
      !Number.isInteger(edad) ||
      edad <= 0 ||
      !Number.isInteger(victorias) ||
      victorias < 0 ||
      !Number.isInteger(derrotas) ||
      derrotas < 0
    ) {
      return res.status(400).json({
        ok: false,
        message: "Edad, victorias y derrotas deben ser numeros validos"
      });
    }

    const newFighter = await fightersService.createFighter({
      nombre: nombre.trim(),
      edad,
      categoria: categoria.trim(),
      victorias,
      derrotas
    });

    res.status(201).json({
      ok: true,
      message: "Peleador creado correctamente",
      data: newFighter
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      message: "Error al crear el peleador"
    });
  }
}

async function updateFighter(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        ok: false,
        message: "El ID debe ser un numero entero positivo"
      });
    }

    const {
      nombre,
      edad,
      categoria,
      victorias,
      derrotas
    } = req.body;

    if (
      nombre === undefined &&
      edad === undefined &&
      categoria === undefined &&
      victorias === undefined &&
      derrotas === undefined
    ) {
      return res.status(400).json({
        ok: false,
        message: "Debes enviar al menos un campo para actualizar"
      });
    }

    if (nombre !== undefined && typeof nombre !== "string") {
      return res.status(400).json({
        ok: false,
        message: "El nombre debe ser texto"
      });
    }

    if (categoria !== undefined && typeof categoria !== "string") {
      return res.status(400).json({
        ok: false,
        message: "La categoria debe ser texto"
      });
    }

    if (
      edad !== undefined &&
      (!Number.isInteger(edad) || edad <= 0)
    ) {
      return res.status(400).json({
        ok: false,
        message: "La edad debe ser un numero entero positivo"
      });
    }

    if (
      victorias !== undefined &&
      (!Number.isInteger(victorias) || victorias < 0)
    ) {
      return res.status(400).json({
        ok: false,
        message: "Las victorias deben ser un numero entero mayor o igual a cero"
      });
    }

    if (
      derrotas !== undefined &&
      (!Number.isInteger(derrotas) || derrotas < 0)
    ) {
      return res.status(400).json({
        ok: false,
        message: "Las derrotas deben ser un numero entero mayor o igual a cero"
      });
    }

    const updatedFighter = await fightersService.updateFighter(id, {
      ...(nombre !== undefined && { nombre: nombre.trim() }),
      ...(edad !== undefined && { edad }),
      ...(categoria !== undefined && { categoria: categoria.trim() }),
      ...(victorias !== undefined && { victorias }),
      ...(derrotas !== undefined && { derrotas })
    });

    if (!updatedFighter) {
      return res.status(404).json({
        ok: false,
        message: "Peleador no encontrado"
      });
    }

    res.status(200).json({
      ok: true,
      message: "Peleador actualizado correctamente",
      data: updatedFighter
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      message: "Error al actualizar el peleador"
    });
  }
}

async function deleteFighter(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        ok: false,
        message: "El ID debe ser un numero entero positivo"
      });
    }

    const deletedFighter = await fightersService.deleteFighter(id);

    if (!deletedFighter) {
      return res.status(404).json({
        ok: false,
        message: "Peleador no encontrado"
      });
    }

    res.status(200).json({
      ok: true,
      message: "Peleador eliminado correctamente",
      data: deletedFighter
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      message: "Error al eliminar el peleador"
    });
  }
}

module.exports = {
  getFighters,
  getFighterById,
  createFighter,
  updateFighter,
  deleteFighter
};