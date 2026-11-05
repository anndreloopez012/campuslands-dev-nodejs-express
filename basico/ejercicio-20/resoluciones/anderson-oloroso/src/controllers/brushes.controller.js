import * as service from "../services/brushes.service.js";

export const listBrushes = (_req, res) => {
  res.json(service.list());
};

export const createBrush = (req, res) => {
  const { name, size, opacity } = req.body;
  const result = service.create(name, size, opacity);

  if (result.errors) {
    return res.status(400).json({ errors: result.errors });
  }

  res.status(201).json(result.data);
};
