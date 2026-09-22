const createMatchesController = ({ matches }) => ({
  list: (req, res) => res.json({ ok: true, data: matches.list(req.query) }),
  get: (req, res) => res.json({ ok: true, data: matches.getById(req.params.id) }),
  create(req, res) {
    const match = matches.create(req.body);
    res.status(201).location(`/matches/${match.id}`).json({ ok: true, data: match });
  },
  start: (req, res) => res.json({ ok: true, data: matches.start(req.params.id) }),
  score: (req, res) => res.json({ ok: true, data: matches.score(req.params.id, req.body) }),
  finish: (req, res) => res.json({ ok: true, data: matches.finish(req.params.id) }),
});

export { createMatchesController };
