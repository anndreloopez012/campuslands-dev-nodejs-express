const models = [
  { id: 1, name: "Dragón Fantástico", polygons: 45000, rigged: true },
  { id: 2, name: "Nave Cyberpunk", polygons: 120000, rigged: false }
];

export const getStatus = (req, res) => {
  res.json({
    ok: true,
    message: "Ejercicio ejecutado correctamente",
    topic: "estructura src routes controllers"
  });
};

export const getModels = (req, res) => {
  res.json({ ok: true, total: models.length, data: models });
};

export const getModelById = (req, res) => {
  const id = Number(req.params.id);
  const found = models.find(m => m.id === id);
  if (!found) {
    return res.status(404).json({ ok: false, message: "Modelo 3D no encontrado" });
  }
  res.json({ ok: true, data: found });
};

export const createModel = (req, res) => {
  const { name, polygons, rigged } = req.body;
  if (!name || polygons === undefined) {
    return res.status(400).json({ ok: false, message: "Nombre y cantidad de polígonos son obligatorios" });
  }
  const newModel = { id: models.length + 1, name, polygons: Number(polygons), rigged: Boolean(rigged) };
  models.push(newModel);
  res.status(201).json({ ok: true, message: "Modelo 3D creado", data: newModel });
};
