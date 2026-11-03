import {
  getToursService,
  getTourByIdService,
  getFeaturedToursService
} from "../services/tours.service.js";
import { BadRequestError } from "../utils/customErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getToursController = asyncHandler(async (req, res) => {
  const { category, destination, maxPrice, featured } = req.query;

  if (maxPrice !== undefined && (isNaN(Number(maxPrice)) || Number(maxPrice) <= 0)) {
    throw new BadRequestError("El parámetro 'maxPrice' debe ser un número mayor a 0.");
  }

  const tours = await getToursService({ category, destination, maxPrice, featured });

  return res.status(200).json({
    status: "success",
    results: tours.length,
    filtersApplied: {
      category: category || null,
      destination: destination || null,
      maxPrice: maxPrice ? Number(maxPrice) : null,
      featured: featured !== undefined ? featured === "true" : null
    },
    data: tours
  });
});

export const getTourByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tour = await getTourByIdService(id);

  return res.status(200).json({
    status: "success",
    data: tour
  });
});

export const getFeaturedToursController = asyncHandler(async (req, res) => {
  const featuredTours = await getFeaturedToursService();

  return res.status(200).json({
    status: "success",
    results: featuredTours.length,
    data: featuredTours
  });
});