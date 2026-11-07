const { Router } = require('express');
const shipsController = require('../controllers/ships.controller');
const missionsController = require('../controllers/missions.controller');

const shipsRouter = Router();
shipsRouter.get('/ships', shipsController.listarNaves);
shipsRouter.post('/ships', shipsController.crearNave);
shipsRouter.delete('/ships/:id', shipsController.eliminarNave);

const missionsRouter = Router();
missionsRouter.get('/missions', missionsController.listarMisiones);
missionsRouter.post('/missions', missionsController.crearMision);
missionsRouter.post('/missions/:id/asignar-nave', missionsController.asignarNave);

module.exports = { shipsRouter, missionsRouter };
