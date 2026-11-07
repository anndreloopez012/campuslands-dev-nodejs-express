const { Router } = require('express');
const showroomController = require('../controllers/showroom.controller');
const asyncHandler = require('../middlewares/async.handler');

const router = Router();

router.get('/autos', asyncHandler(showroomController.listarAutos));
router.post('/autos/:id/reservar', asyncHandler(showroomController.reservarAuto));
router.post('/autos/:id/liberar', asyncHandler(showroomController.liberarAuto));

module.exports = router;
