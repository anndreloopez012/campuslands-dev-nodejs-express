const { Router } = require('express');
const controller = require('../controllers/destinations.controller');
const destinationsRoutes = require('./destinations.routes');

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true, status: 'up' }));
router.get('/basico/ejercicio-17', controller.info);
router.use('/destinations', destinationsRoutes);
router.get('/countries/:country/destinations', controller.byCountry);

module.exports = router;
