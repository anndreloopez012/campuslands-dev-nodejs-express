import {
  getAllFightersService,
  createFighterService
} from "../services/kickboxing.service.js";

export const getFightersController = async (req, res) => {
  try {
    const fighters = await getAllFightersService();
    return res.status(200).json({
      status: "success",
      total: fighters.length,
      data: fighters
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error al consultar el registro de luchadores."
    });
  }
};

export const createFighterController = async (req, res) => {
  try {
    const { name, weightClass, wins, losses, kos } = req.body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "El campo 'name' es obligatorio y debe ser un texto válido."
      });
    }

    if (!weightClass || typeof weightClass !== "string" || weightClass.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "El campo 'weightClass' es obligatorio y debe ser un texto válido."
      });
    }

    const newFighter = await createFighterService({
      name: name.trim(),
      weightClass: weightClass.trim(),
      wins,
      losses,
      kos
    });

    return res.status(201).json({
      status: "success",
      data: newFighter
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error al guardar el nuevo luchador en disco."
    });
  }
};