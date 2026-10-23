const createDropsController = ({ drops }) => ({
  list: (req, res) => res.json({ ok: true, data: drops.list(req.query) }),
  get: (req, res) => res.json({ ok: true, data: drops.getById(req.params.id) }),
  create(req, res) {
    const drop = drops.create(req.body);
    res.status(201).location(`/drops/${drop.id}`).json({ ok: true, data: drop });
  },
  claim: (req, res) => res.json({ ok: true, data: drops.claim(req.params.id) }),
  remove(req, res) {
    drops.remove(req.params.id);
    res.status(204).end();
  },
});

export { createDropsController };
