import { BadRequestError } from "../utils/customErrors.js";

// Expresión regular para validar formato ISBN-13 (ej: 978-0141439518 o 9780141439518)
const ISBN_REGEX = /^(?:ISBN(?:-13)?:?\s*)?(97[89][-\s]?[0-9]{1,5}[-\s]?[0-9]+[-\s]?[0-9]+[-\s]?[0-9])$/;

export const validateCreateBook = (req, res, next) => {
  const { isbn, title, author, genre, pages, price, inStock } = req.body;
  const validationErrors = [];

  // 1. Validación de ISBN
  if (!isbn || typeof isbn !== "string") {
    validationErrors.push({ field: "isbn", message: "El campo 'isbn' es obligatorio y debe ser un texto." });
  } else if (!ISBN_REGEX.test(isbn.trim())) {
    validationErrors.push({ field: "isbn", message: "El 'isbn' no tiene un formato válido de ISBN-13." });
  }

  // 2. Validación de Título
  if (!title || typeof title !== "string" || title.trim().length === 0) {
    validationErrors.push({ field: "title", message: "El campo 'title' es obligatorio y no puede estar vacío." });
  } else if (title.trim().length < 2 || title.trim().length > 150) {
    validationErrors.push({ field: "title", message: "El campo 'title' debe tener entre 2 y 150 caracteres." });
  }

  // 3. Validación de Autor
  if (!author || typeof author !== "string" || author.trim().length === 0) {
    validationErrors.push({ field: "author", message: "El campo 'author' es obligatorio." });
  }

  // 4. Validación de Género Literario
  if (!genre || typeof genre !== "string" || genre.trim().length === 0) {
    validationErrors.push({ field: "genre", message: "El campo 'genre' es obligatorio." });
  }

  // 5. Validación de Páginas (entero positivo)
  const numericPages = Number(pages);
  if (pages === undefined || !Number.isInteger(numericPages) || numericPages <= 0) {
    validationErrors.push({ field: "pages", message: "El campo 'pages' debe ser un número entero mayor a 0." });
  }

  // 6. Validación de Precio (número positivo)
  const numericPrice = Number(price);
  if (price === undefined || isNaN(numericPrice) || numericPrice <= 0) {
    validationErrors.push({ field: "price", message: "El campo 'price' debe ser un número positivo mayor a 0." });
  }

  // 7. Validación opcional de Disponibilidad (Booleano)
  if (inStock !== undefined && typeof inStock !== "boolean") {
    validationErrors.push({ field: "inStock", message: "El campo 'inStock' debe ser un valor booleano (true/false)." });
  }

  if (validationErrors.length > 0) {
    return next(new BadRequestError("Se encontraron errores de validación en la petición.", validationErrors));
  }

  // Sanitización de datos de entrada
  req.body = {
    isbn: isbn.trim(),
    title: title.trim(),
    author: author.trim(),
    genre: genre.trim(),
    pages: numericPages,
    price: Number(numericPrice.toFixed(2)),
    inStock: inStock !== undefined ? inStock : true
  };

  next();
};

export const validateBookId = (req, res, next) => {
  const { id } = req.params;

  if (!id || typeof id !== "string" || id.trim().length === 0) {
    return next(new BadRequestError("El parámetro de ruta 'id' es inválido."));
  }

  next();
};