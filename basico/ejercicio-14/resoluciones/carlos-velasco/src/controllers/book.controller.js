const bookService = require('../services/book.service');

const createBook = (req, res) => {
  try {
    const book = bookService.createBook(req.body);

    res.status(201).json({
      ok: true,
      message: 'Libro creado correctamente',
      topic: 'validacion de entrada',
      data: book
    });
  } catch (error) {
    console.error('Error al crear el libro:', error.message);

    res.status(error.statusCode || 500).json({
      ok: false,
      message: error.message || 'Error interno del servidor'
    });
  }
};

module.exports = {
  createBook
};