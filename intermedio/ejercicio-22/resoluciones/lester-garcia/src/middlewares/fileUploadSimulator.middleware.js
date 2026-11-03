import { createHash } from "node:crypto";
import path from "node:path";
import { uploadConfig } from "../config/upload.config.js";
import {
  ValidationError,
  PayloadTooLargeError,
  UnsupportedMediaTypeError
} from "../utils/customErrors.js";

export const simulateFileUploadMiddleware = (req, res, next) => {
  const { fileName, mimeType, fileSizeBytes } = req.body || {};

  if (!fileName || typeof fileName !== "string") {
    return next(new ValidationError([{ field: "fileName", message: "Nombre de archivo con extensión requerido." }]));
  }

  const ext = path.extname(fileName.trim()).toLowerCase();
  if (!uploadConfig.allowedExtensions.includes(ext)) {
    return next(
      new UnsupportedMediaTypeError(
        `Extensión '${ext || "sin-extensión"}' no permitida. Formatos BIM/CAD aceptados: ${uploadConfig.allowedExtensions.join(", ")}.`
      )
    );
  }

  if (!mimeType || !uploadConfig.allowedMimeTypes.includes(mimeType.trim())) {
    return next(
      new UnsupportedMediaTypeError(
        `Tipo MIME '${mimeType}' no válido. Aceptados: ${uploadConfig.allowedMimeTypes.join(", ")}.`
      )
    );
  }

  const size = Number(fileSizeBytes);
  if (isNaN(size) || size <= 0) {
    return next(new ValidationError([{ field: "fileSizeBytes", message: "El tamaño en bytes debe ser un número positivo." }]));
  }

  if (size > uploadConfig.maxFileSizeBytes) {
    return next(
      new PayloadTooLargeError(
        `El modelo pesa ${(size / (1024 * 1024)).toFixed(2)} MB y supera el límite de ${uploadConfig.maxFileSizeMb} MB.`
      )
    );
  }

  const sanitizedBase = path
    .basename(fileName.trim(), ext)
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-");
  const uniqueKey = `${Date.now()}-${sanitizedBase}${ext}`;
  const checksumSha256 = createHash("sha256")
    .update(`${uniqueKey}:${size}:${mimeType}`)
    .digest("hex");

  req.uploadedFile = {
    originalName: fileName.trim(),
    storedFileName: uniqueKey,
    extension: ext,
    mimeType: mimeType.trim(),
    sizeBytes: size,
    sizeMb: Number((size / (1024 * 1024)).toFixed(2)),
    checksumSha256,
    storageUrl: `${uploadConfig.storageBucketUrl}/${uniqueKey}`
  };

  next();
};
