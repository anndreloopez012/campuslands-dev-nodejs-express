import * as booksRepo from "../repositories/books.inMemory.repository.js";
import { NotFoundError, ConflictError, ForbiddenError } from "../utils/customErrors.js";

export const getAllBooksService = async (genre) => {
  let books = await booksRepo.findAllBooks();
  if (genre) {
    books = books.filter((b) => b.genre.toLowerCase() === genre.toLowerCase());
  }
  return books;
};

export const getBookByIdService = async (id) => {
  const book = await booksRepo.findBookById(id);
  if (!book) {
    throw new NotFoundError(`El libro con ID '${id}' no existe en el catálogo.`);
  }
  return book;
};

export const createBookService = async (payload, currentUser) => {
  const existing = await booksRepo.findBookByIsbn(payload.isbn);
  if (existing) {
    throw new ConflictError(`El libro con ISBN '${payload.isbn}' ya se encuentra registrado.`);
  }

  const newBook = {
    id: String(Date.now()),
    isbn: payload.isbn.trim(),
    title: payload.title.trim(),
    author: payload.author.trim(),
    genre: payload.genre.trim(),
    pages: Number(payload.pages),
    publishYear: Number(payload.publishYear),
    createdById: currentUser.id // Registro de auditoría del usuario autenticado
  };

  return await booksRepo.saveBook(newBook);
};

export const deleteBookService = async (id, currentUser) => {
  const book = await booksRepo.findBookById(id);
  if (!book) {
    throw new NotFoundError(`No se puede eliminar. El libro con ID '${id}' no existe.`);
  }

  // Regla de autorización: Solo el creador original o un Editor pueden eliminar un libro
  if (book.createdById !== currentUser.id && currentUser.role !== "Editor") {
    throw new ForbiddenError("No tienes permiso para eliminar libros registrados por otros usuarios.");
  }

  await booksRepo.deleteBook(id);
};