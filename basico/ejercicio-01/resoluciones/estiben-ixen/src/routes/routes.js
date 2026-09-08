const express = require('express');

const router = express.Router();

const {ejecutarEjercicio} = require(`../controllers/controller`);

router.get(`/basico/ejercicio-01`, ejecutarEjercicio);

module.exports = router;

