const VALID_SOFTWARE = ["Procreate", "Clip Studio Paint", "Photoshop", "Krita", "Illustrator"];
const VALID_COLOR_PROFILES = ["sRGB", "Display P3", "Adobe RGB", "CMYK"];

export const createIllustrationValidator = (req) => {
  const errors = [];
  const { title, artist, software, canvasResolution, layersCount, colorProfile } = req.body || {};

  if (!req.body || Object.keys(req.body).length === 0) {
    return [{ field: "body", message: "El cuerpo de la petición no puede estar vacío." }];
  }

  if (!title || typeof title !== "string" || title.trim().length < 3) {
    errors.push({ field: "title", message: "El título de la obra debe tener al menos 3 caracteres." });
  }

  if (!artist || typeof artist !== "string" || artist.trim().length < 3) {
    errors.push({ field: "artist", message: "El nombre del ilustrador digital es obligatorio." });
  }

  if (!software || !VALID_SOFTWARE.includes(software.trim())) {
    errors.push({ field: "software", message: `Software no soportado. Válidos: ${VALID_SOFTWARE.join(", ")}.` });
  }

  if (!canvasResolution || typeof canvasResolution !== "string" || !/^\d{3,5}x\d{3,5}$/.test(canvasResolution.trim())) {
    errors.push({ field: "canvasResolution", message: "La resolución debe tener el formato ANCHOxALTO (ej. 3840x2160)." });
  }

  const layers = Number(layersCount);
  if (isNaN(layers) || layers < 1 || layers > 500) {
    errors.push({ field: "layersCount", message: "La cantidad de capas debe estar entre 1 y 500." });
  }

  if (!colorProfile || !VALID_COLOR_PROFILES.includes(colorProfile.trim())) {
    errors.push({ field: "colorProfile", message: `Perfil de color inválido. Válidos: ${VALID_COLOR_PROFILES.join(", ")}.` });
  }

  return errors;
};
