const { Router } = require('express');
const heroesController = require('../controllers/heroes.controller');

const router = Router();

router.get('/heroes', heroesController.listarHeroes);
router.get('/heroes/:id', heroesController.obtenerHeroe);
router.post('/heroes', heroesController.crearHeroe);
router.delete('/heroes/:id', heroesController.eliminarHeroe);

module.exports = router;
