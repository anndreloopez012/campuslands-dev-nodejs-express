import {
  getAllArtworksService,
  getArtworkByIdService,
  createArtworkService
} from "../services/artworks.service.js";
import { BadRequestError } from "../utils/customErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getArtworksController = asyncHandler(async (req, res) => {
  const artworks = await getAllArtworksService();
  return res.status(200).json({
    status: "success",
    total: artworks.length,
    data: artworks
  });
});

export const getArtworkByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const artwork = await getArtworkByIdService(id);
  return res.status(200).json({
    status: "success",
    data: artwork
  });
});

export const createArtworkController = asyncHandler(async (req, res) => {
  // Comprobación de existencia de req.body (si no se envía Content-Type: application/json, req.body viene vacío {})
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new BadRequestError(
      "El cuerpo de la petición está vacío. Asegúrate de enviar un objeto JSON y el encabezado 'Content-Type: application/json'."
    );
  }

  const { title, artist, software, canvasWidth, canvasHeight, layersCount, priceUSD, isCommercialUse } = req.body;

  // Validaciones primarias de entrada
  if (!title || typeof title !== "string" || title.trim() === "") {
    throw new BadRequestError("El campo 'title' es obligatorio.");
  }

  if (!artist || typeof artist !== "string" || artist.trim() === "") {
    throw new BadRequestError("El campo 'artist' es obligatorio.");
  }

  if (!software || typeof software !== "string" || software.trim() === "") {
    throw new BadRequestError("El campo 'software' (ej. Procreate, Photoshop, Clip Studio) es obligatorio.");
  }

  const w = Number(canvasWidth);
  const h = Number(canvasHeight);
  if (!canvasWidth || isNaN(w) || w <= 0 || !canvasHeight || isNaN(h) || h <= 0) {
    throw new BadRequestError("Los campos 'canvasWidth' y 'canvasHeight' deben ser números positivos.");
  }

  const layers = Number(layersCount);
  if (layersCount === undefined || isNaN(layers) || layers <= 0) {
    throw new BadRequestError("El campo 'layersCount' (número de capas) debe ser un número entero mayor a 0.");
  }

  const price = Number(priceUSD);
  if (priceUSD === undefined || isNaN(price) || price <= 0) {
    throw new BadRequestError("El campo 'priceUSD' debe ser un número positivo.");
  }

  const newArtwork = await createArtworkService({
    title: title.trim(),
    artist: artist.trim(),
    software: software.trim(),
    canvasWidth: w,
    canvasHeight: h,
    layersCount: layers,
    priceUSD: price,
    isCommercialUse
  });

  return res.status(201).json({
    status: "success",
    data: newArtwork
  });
});