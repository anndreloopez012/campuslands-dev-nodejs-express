const createMotorcyclesController = ({ motorcycles }) => ({
  list: (req, res) => res.json({ ok: true, data: motorcycles.list() }),
  get: (req, res) => res.json({ ok: true, data: motorcycles.getById(req.params.id) }),
  create(req, res) {
    const motorcycle = motorcycles.create(req.body);
    res.status(201).location(`/motorcycles/${motorcycle.id}`).json({ ok: true, data: motorcycle });
  },
});

export { createMotorcyclesController };
