import {
  getAllJumpsService,
  getJumpByIdService,
  createJumpService
} from "../services/skydive.service.js";
import { BadRequestError } from "../utils/customErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const VALID_JUMP_TYPES = ["Tandem", "Solo AFF", "Freefly", "Wingsuit", "Coaching"];

export const getJumpsController = asyncHandler(async (req, res) => {
  const jumps = await getAllJumpsService();
  return res.status(200).json({
    status: "success",
    total: jumps.length,
    data: jumps
  });
});

export const getJumpByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const jump = await getJumpByIdService(id);
  return res.status(200).json({
    status: "success",
    data: jump
  });
});

export const createJumpController = asyncHandler(async (req, res) => {
  const { jumperName, jumpType, altitudeFeet, dropzone, priceUSD, hasVideoPackage } = req.body;

  // 1. Validar jumperName
  if (!jumperName || typeof jumperName !== "string" || jumperName.trim() === "") {
    throw new BadRequestError("El campo 'jumperName' es obligatorio y debe ser un texto válido.");
  }

  // 2. Validar jumpType contra modalidades permitidas
  if (!jumpType || typeof jumpType !== "string" || !VALID_JUMP_TYPES.includes(jumpType.trim())) {
    throw new BadRequestError(
      `El campo 'jumpType' es inválido. Modalidades permitidas: ${VALID_JUMP_TYPES.join(", ")}.`
    );
  }

  // 3. Validar altitudeFeet (mínimo 3000 pies, máximo 18000 pies)
  const numericAltitude = Number(altitudeFeet);
  if (altitudeFeet === undefined || isNaN(numericAltitude) || numericAltitude < 3000 || numericAltitude > 18000) {
    throw new BadRequestError("El campo 'altitudeFeet' debe ser un número entre 3,000 y 18,000 pies.");
  }

  // 4. Validar dropzone
  if (!dropzone || typeof dropzone !== "string" || dropzone.trim() === "") {
    throw new BadRequestError("El campo 'dropzone' (zona de salto) es obligatorio.");
  }

  // 5. Validar priceUSD
  const numericPrice = Number(priceUSD);
  if (priceUSD === undefined || isNaN(numericPrice) || numericPrice <= 0) {
    throw new BadRequestError("El campo 'priceUSD' debe ser un número positivo mayor a 0.");
  }

  const newJump = await createJumpService({
    jumperName: jumperName.trim(),
    jumpType: jumpType.trim(),
    altitudeFeet: numericAltitude,
    dropzone: dropzone.trim(),
    priceUSD: numericPrice,
    hasVideoPackage
  });

  return res.status(201).json({
    status: "success",
    data: newJump
  });
});