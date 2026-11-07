const heroService = require("../services/hero.service");
const { validateBody } = require("../middlewares/validate.middleware");
const { heroSchema } = require("../validators/heroes.schema");

const router = require("express").Router();

router.get("/heroes", (req, res, next) => {
  try {
    const heroes = heroService.listHeroes(req.query.role);
    res.status(200).json({ ok: true, count: heroes.length, data: heroes });
  } catch (error) {
    next(error);
  }
});

router.get("/heroes/:id", (req, res, next) => {
  try {
    res.status(200).json({ ok: true, data: heroService.getHeroById(req.params.id) });
  } catch (error) {
    next(error);
  }
});

// La validacion por schema vive como middleware de ruta:
// el controlador nunca recibe un cuerpo invalido.
router.post("/heroes", validateBody(heroSchema), (req, res, next) => {
  try {
    const hero = heroService.createHero(req.body);
    res.status(201).json({ ok: true, message: "Heroe registrado en el draft", data: hero });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
