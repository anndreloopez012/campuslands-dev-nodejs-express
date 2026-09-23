
const mobaService = require('../services/moba.service');

const getHealth = (req, res) => {
  res.status(200).json({
    ok: true,
    message: "Ejercicio ejecutado correctamente",
    topic: "modulos CommonJS"
  });
};

const listHeroes = (req, res) => {
  try {
    const data = mobaService.getHeroes();
    res.status(200).json({ ok: true, total: data.length, data });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

const createHero = (req, res) => {
  try {
    const { name, role } = req.body;
    if (!name || !role) {
      return res.status(400).json({ ok: false, message: "Los campos 'name' y 'role' son obligatorios." });
    }
    const newHero = mobaService.addHero({ name, role, tier: req.body.tier || "B" });
    res.status(201).json({ ok: true, message: "Héroe registrado con éxito", data: newHero });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

module.exports = {
  getHealth,
  listHeroes,
  createHero
};