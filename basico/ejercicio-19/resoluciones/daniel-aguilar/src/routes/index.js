const { Router } = require('express');
const controller = require('../controllers/artists.controller');

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true, status: 'up' }));
router.get('/basico/ejercicio-19', controller.info);
router.get('/artists', controller.list);
router.get('/artists/:id', controller.detail);
router.get('/artists/:id/works', controller.artistWorks);
router.get('/studios/:studio/artists/:artistId', controller.studioArtist);

module.exports = router;
