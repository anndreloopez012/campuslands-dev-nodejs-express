import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NotFoundError, ConflictError } from "../utils/customErrors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "../data/books.json");

const readBooksFile = async () => {
  const data = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(data);
};

const writeBooksFile = async (data) => {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
};

export const getAllBooksService = async () => {
  return await readBooksFile();
};

export const getBookByIdService = async (id) => {
  const books = await readBooksFile();
  const book = books.find((b) => b.id === String(id));

  if (!book) {
    throw new NotFoundError(`El libro con ID '${id}' no fue encontrado en el catálogo.`);
  }

  return book;
};

export const createBookService = async ({ isbn, title, author, genre, pages, price, inStock }) => {
  const books = await readBooksFile();

  const isbnExists = books.some((b) => b.isbn === isbn);
  if (isbnExists) {
    throw new ConflictError(`El libro con ISBN '${isbn}' ya existe en la biblioteca.`);
  }

  const newBook = {
    id: String(Date.now()),
    isbn,
    title,
    author,
    genre,
    pages,
    price,
    inStock
  };

  books.push(newBook);
  await writeBooksFile(books);

  return newBook;
};