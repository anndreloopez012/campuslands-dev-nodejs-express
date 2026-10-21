import * as booksService from "../services/books.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getBooksController = asyncHandler(async (req, res) => {
  const books = await booksService.getAllBooksService(req.query.genre);
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    total: books.length,
    data: books
  });
});

export const getBookByIdController = asyncHandler(async (req, res) => {
  const book = await booksService.getBookByIdService(req.params.id);
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    data: book
  });
});

export const createBookController = asyncHandler(async (req, res) => {
  // El usuario autenticado está en req.user
  const newBook = await booksService.createBookService(req.body, req.user);
  return res.status(201).json({
    status: "success",
    requestId: req.id,
    data: newBook
  });
});

export const deleteBookController = asyncHandler(async (req, res) => {
  await booksService.deleteBookService(req.params.id, req.user);
  return res.status(204).send();
});