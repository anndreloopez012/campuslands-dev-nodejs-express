const express = require('express');
const { list } = require('../controllers/characters');

const router = express.Router();
router.get('/', list);

module.exports = router;
