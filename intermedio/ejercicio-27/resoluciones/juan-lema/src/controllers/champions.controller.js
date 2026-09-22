const createChampionsController = ({ champions }) => ({
  list: (req, res) => res.json({ ok: true, data: champions.list({ role: req.query.role }) }),
  get: (req, res) => res.json({ ok: true, data: champions.getById(req.params.id) }),
  create(req, res) {
    const champion = champions.create(req.body);
    res.status(201).location(`/champions/${champion.id}`).json({ ok: true, data: champion });
  },
});

export { createChampionsController };
