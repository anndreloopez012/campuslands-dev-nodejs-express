import * as service from "../services/destinations.service.js";

export const listAll = async (_req, res) => {
  try {
    const data = await service.getAll();
    res.json(data);
  } catch {
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const getOne = async (req, res) => {
  try {
    const result = await service.getById(req.params.id);

    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }

    res.json(result.data);
  } catch {
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
