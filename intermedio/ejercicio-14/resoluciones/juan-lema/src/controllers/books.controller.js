import { listBooks, getBookById, createBook } from "../services/books.service.js";

const getBooks = (req, res) => res.json({ ok: true, data: listBooks() });

function getBook(req, res) {
  const { id } = req.params;
  if (!Number.isInteger(Number(id))) return res.status(400).json({ ok: false, message: "id debe ser numerico" });

  const book = getBookById(id);
  if (!book) return res.status(404).json({ ok: false, message: `Libro con id ${id} no encontrado` });

  res.json({ ok: true, data: book });
}

function postBook(req, res) {
  try {
    res.status(201).json({ ok: true, addedBy: req.user.username, data: createBook(req.body || {}) });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

export { getBooks, getBook, postBook };
