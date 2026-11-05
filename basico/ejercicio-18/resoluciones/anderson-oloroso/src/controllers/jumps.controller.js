import * as service from "../services/jumps.service.js";

export const listJumps = (_req, res) => {
  res.json(service.list());
};

export const createJump = (req, res) => {
  const { diverName, altitude } = req.body;
  const result = service.add(diverName, altitude);

  if (result.errors) {
    return res.status(400).json({ errors: result.errors });
  }

  res.status(201).json(result.data);
};
