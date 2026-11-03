import {
  getTattoosService,
  getTattooByIdService,
  getTattoosByArtistService
} from "../services/tattoos.service.js";
import { BadRequestError } from "../utils/customErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getTattoosController = asyncHandler(async (req, res) => {
  // Captura de req.query (parámetros opcionales de búsqueda)
  const { style, artist, maxPrice, available } = req.query;

  if (maxPrice !== undefined && (isNaN(Number(maxPrice)) || Number(maxPrice) <= 0)) {
    throw new BadRequestError("El parámetro query 'maxPrice' debe ser un número positivo.");
  }

  if (available !== undefined && available !== "true" && available !== "false") {
    throw new BadRequestError("El parámetro query 'available' debe ser 'true' o 'false'.");
  }

  const tattoos = await getTattoosService({ style, artist, maxPrice, available });

  return res.status(200).json({
    status: "success",
    results: tattoos.length,
    queryParamsReceived: req.query,
    data: tattoos
  });
});

export const getTattooByIdController = asyncHandler(async (req, res) => {
  // Captura de req.params (parámetro obligatorio de ruta)
  const { id } = req.params;

  const tattoo = await getTattooByIdService(id);

  return res.status(200).json({
    status: "success",
    routeParamsReceived: req.params,
    data: tattoo
  });
});

export const getTattoosByArtistController = asyncHandler(async (req, res) => {
  // Captura de req.params para un nombre de artista
  const { artistName } = req.params;

  if (!artistName || artistName.trim() === "") {
    throw new BadRequestError("El parámetro de ruta 'artistName' no puede estar vacío.");
  }

  const tattoos = await getTattoosByArtistService(artistName);

  return res.status(200).json({
    status: "success",
    results: tattoos.length,
    routeParamsReceived: req.params,
    data: tattoos
  });
});