const toNumber = (value) => (value === undefined ? undefined : Number(value));

const createCharactersController = ({ characters }) => ({
  list(req, res) {
    const { class: characterClass, minLevel, sort, page, limit } = req.query;
    const { items, meta } = characters.list({ class: characterClass, minLevel: toNumber(minLevel), sort, page: toNumber(page), limit: toNumber(limit) });

    res.set("X-Total-Count", String(meta.total)).json({ ok: true, data: items, meta });
  },
  get: (req, res) => res.json({ ok: true, data: characters.getById(req.params.id) }),
  create(req, res) {
    const character = characters.create(req.body, req.user);
    res.status(201).location(`/characters/${character.id}`).json({ ok: true, data: character });
  },
  update: (req, res) => res.json({ ok: true, data: characters.update(req.params.id, req.body, req.user) }),
  remove(req, res) {
    characters.remove(req.params.id, req.user);
    res.status(204).end();
  },
});

export { createCharactersController };
