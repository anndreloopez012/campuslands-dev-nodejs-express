const booksService = require("../services/books.service");

function getBooks(req, res) {
  const books = booksService.getAllBooks();

  res.status(200).json({
    ok: true,
    message: "Libros obtenidos correctamente",
    total: books.length,
    data: books
  });
}

function createBook(req, res) {
  const { titulo, autor, anio, genero, paginas } = req.body;

  if (!titulo || typeof titulo !== "string" || !titulo.trim()) {
    return res.status(400).json({
      ok: false,
      message: "El titulo es obligatorio y debe ser texto"
    });
  }

  if (!autor || typeof autor !== "string" || !autor.trim()) {
    return res.status(400).json({
      ok: false,
      message: "El autor es obligatorio y debe ser texto"
    });
  }

  if (
    anio === undefined ||
    !Number.isInteger(anio) ||
    anio < 0
  ) {
    return res.status(400).json({
      ok: false,
      message: "El anio es obligatorio y debe ser un numero entero positivo"
    });
  }

  if (!genero || typeof genero !== "string" || !genero.trim()) {
    return res.status(400).json({
      ok: false,
      message: "El genero es obligatorio y debe ser texto"
    });
  }

  if (
    paginas === undefined ||
    !Number.isInteger(paginas) ||
    paginas <= 0
  ) {
    return res.status(400).json({
      ok: false,
      message: "Las paginas son obligatorias y deben ser un numero entero positivo"
    });
  }

  const newBook = booksService.createBook({
    titulo: titulo.trim(),
    autor: autor.trim(),
    anio,
    genero: genero.trim(),
    paginas
  });

  res.status(201).json({
    ok: true,
    message: "Libro creado correctamente",
    data: newBook
  });
}

module.exports = {
  getBooks,
  createBook
};