import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NotFoundError } from "../utils/customErrors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "../data/tours.json");

const readToursFile = async () => {
  const data = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(data);
};

export const getToursService = async (filters = {}) => {
  let tours = await readToursFile();
  const { category, destination, maxPrice, featured } = filters;

  if (category) {
    tours = tours.filter(
      (t) => t.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (destination) {
    tours = tours.filter((t) =>
      t.destination.toLowerCase().includes(destination.toLowerCase())
    );
  }

  if (maxPrice) {
    const numericMaxPrice = Number(maxPrice);
    tours = tours.filter((t) => t.priceUSD <= numericMaxPrice);
  }

  if (featured !== undefined) {
    const isFeatured = featured === "true";
    tours = tours.filter((t) => t.featured === isFeatured);
  }

  return tours;
};

export const getTourByIdService = async (id) => {
  const tours = await readToursFile();
  const tour = tours.find((t) => t.id === String(id));

  if (!tour) {
    throw new NotFoundError(`El tour turístico con ID '${id}' no existe en nuestro catálogo.`);
  }

  return tour;
};

export const getFeaturedToursService = async () => {
  const tours = await readToursFile();
  return tours.filter((t) => t.featured === true);
};