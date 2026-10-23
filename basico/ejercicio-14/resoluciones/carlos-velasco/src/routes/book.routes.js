const express = require('express');
const bookController = require('../controllers/book.controller');

const router = express.Router();

router.post('/books', bookController.createBook);

module.exports = router;