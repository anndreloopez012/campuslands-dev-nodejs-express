const service = require('../services/books.service');
const { validateBook, validateListQuery, validateId } = require('../validators/book.validator');

const invalid = (res, errors) => res.status(400).json({ ok: false, message: 'Datos invalidos', errors });

const info = (req, res) =>
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'validacion de entrada',
  });

function list(req, res) {
  const { value, errors } = validateListQuery(req.query);
  if (errors.length > 0) return invalid(res, errors);
  const { items, total, page, limit } = service.listBooks(value);
  res.json({ ok: true, page, limit, total, books: items });
}

function detail(req, res) {
  const id = validateId(req.params.id);
  if (!id) return invalid(res, [{ field: 'id', message: 'Debe ser un entero positivo' }]);
  const book = service.getBook(id);
  if (!book) return res.status(404).json({ ok: false, message: 'Libro no encontrado' });
  res.json({ ok: true, book });
}

function create(req, res) {
  const { value, errors } = validateBook(req.body);
  if (errors.length > 0) return invalid(res, errors);
  res.status(201).json({ ok: true, book: service.createBook(value) });
}

module.exports = { info, list, detail, create };
