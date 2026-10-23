import {
  getAllBooksService,
  getBookByIdService,
  createBookService
} from "../services/books.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getBooksController = asyncHandler(async (req, res) => {
  const books = await getAllBooksService();
  return res.status(200).json({
    status: "success",
    total: books.length,
    data: books
  });
});

export const getBookByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const book = await getBookByIdService(id);

  return res.status(200).json({
    status: "success",
    data: book
  });
});

export const createBookController = asyncHandler(async (req, res) => {
  // Los datos en req.body ya fueron previamente validados y sanitizados
  const newBook = await createBookService(req.body);

  return res.status(201).json({
    status: "success",
    data: newBook
  });
});