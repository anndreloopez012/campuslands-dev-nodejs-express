const { Router } = require('express');
const { crearControladores } = require('../controllers/base.controller');
const armasService = require('../services/armas.service');
const escuadrasService = require('../services/escuadras.service');

const armasController = crearControladores({ servicio: armasService, recurso: 'Arma' });
const escuadrasController = crearControladores({ servicio: escuadrasService, recurso: 'Escuadra' });

const armasRouter = Router();
armasRouter.get('/', armasController.listar);
armasRouter.get('/:id', armasController.obtener);
armasRouter.post('/', armasController.crear);
armasRouter.patch('/:id', armasController.actualizar);
armasRouter.delete('/:id', armasController.eliminar);

const escuadrasRouter = Router();
escuadrasRouter.get('/', escuadrasController.listar);
escuadrasRouter.get('/:id', escuadrasController.obtener);
escuadrasRouter.post('/', escuadrasController.crear);
escuadrasRouter.put('/:id', escuadrasController.actualizar);
escuadrasRouter.delete('/:id', escuadrasController.eliminar);

module.exports = { armasRouter, escuadrasRouter };
