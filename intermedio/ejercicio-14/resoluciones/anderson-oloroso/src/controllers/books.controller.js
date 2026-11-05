import * as bookService from '../services/books.service.js';

export const getHealth = (_req, res) => res.status(200).json({ ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'autenticacion simulada' });

export const listBooks = (_req, res) => res.status(200).json({ ok: true, total: bookService.getBooks().length, data: bookService.getBooks() });

export const createBook = (req, res) => {
  const { titulo, autor, paginas, seccion } = req.body;
  if (!titulo || !autor) return res.status(400).json({ ok: false, message: 'titulo y autor son obligatorios.' });
  const book = bookService.addBook({ titulo, autor, paginas, seccion });
  return res.status(201).json({ ok: true, message: 'Libro ingresado al catálogo oficial', usuario: req.user, data: book });
};
