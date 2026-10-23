import * as service from '../services/books.service.js';

export const getStatus = (req, res) => {
  res.json({
    ok: true,
    message: "Ejercicio ejecutado correctamente",
    topic: "validacion de entrada"
  });
};

export const getBooks = (req, res) => {
  res.json({ ok: true, data: service.getAll() });
};

export const createBook = (req, res) => {
  const { title, author, year, pages } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || !title.trim()) {
    errors.push("El campo 'title' es obligatorio y debe ser texto.");
  }
  if (!author || typeof author !== 'string' || !author.trim()) {
    errors.push("El campo 'author' es obligatorio y debe ser texto.");
  }
  if (year === undefined || isNaN(Number(year)) || Number(year) < 0 || Number(year) > 2030) {
    errors.push("El campo 'year' debe ser un número de año válido.");
  }
  if (pages === undefined || isNaN(Number(pages)) || Number(pages) <= 0) {
    errors.push("El campo 'pages' debe ser un número entero positivo.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ ok: false, message: "Validación fallida", errors });
  }

  const created = service.create({ title, author, year, pages });
  res.status(201).json({ ok: true, message: "Libro registrado exitosamente", data: created });
};
