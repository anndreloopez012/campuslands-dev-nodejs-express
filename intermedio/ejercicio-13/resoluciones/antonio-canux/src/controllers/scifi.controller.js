import { authors, books } from '../data/scifi.data.js';

export const listAuthors = (req, res) => {
  res.status(200).json({ ok: true, data: authors });
};

// Autor con sus libros (uno a muchos)
export const getAuthor = (req, res) => {
  const author = authors.find((a) => a.id === Number(req.params.id));
  if (!author) return res.status(404).json({ ok: false, message: "Autor no encontrado" });

  res.status(200).json({ ok: true, data: { ...author, books: books.filter((b) => b.authorId === author.id) } });
};

// Libro con su autor (muchos a uno)
export const getBook = (req, res) => {
  const book = books.find((b) => b.id === Number(req.params.id));
  if (!book) return res.status(404).json({ ok: false, message: "Libro no encontrado" });

  const { authorId, ...rest } = book;
  res.status(200).json({ ok: true, data: { ...rest, author: authors.find((a) => a.id === authorId) } });
};
