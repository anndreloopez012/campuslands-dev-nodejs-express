const { Router } = require('express');
const controller = require('../controllers/compounds.controller');

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true, status: 'up' }));
router.get('/basico/ejercicio-24', controller.info);

router.get('/compounds', controller.list);          // Read (lista)
router.get('/compounds/:id', controller.detail);    // Read (uno)
router.post('/compounds', controller.create);       // Create
router.put('/compounds/:id', controller.update);    // Update
router.delete('/compounds/:id', controller.remove); // Delete

module.exports = router;
