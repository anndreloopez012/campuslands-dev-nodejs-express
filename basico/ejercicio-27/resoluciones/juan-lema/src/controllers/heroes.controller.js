import { listHeroes, createHero } from "../services/heroes.service.js";

function getHeroes(req, res) {
  res.status(200).json({ ok: true, data: listHeroes() });
}

function postHero(req, res) {
  try {
    const hero = createHero(req.body || {});
    res.status(201).json({ ok: true, data: hero });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

export { getHeroes, postHero };
