const express = require('express');
const controller = require('../controllers/motos');

const router = express.Router();
router.get('/', controller.list);
router.post('/', controller.create);

module.exports = router;
