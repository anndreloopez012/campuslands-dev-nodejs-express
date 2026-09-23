
const { Router } = require('express');
const mobaController = require('../controllers/moba.controller');

const router = Router();

router.get('/health', mobaController.getHealth);
router.get('/heroes', mobaController.listHeroes);
router.post('/heroes', mobaController.createHero);

module.exports = router;