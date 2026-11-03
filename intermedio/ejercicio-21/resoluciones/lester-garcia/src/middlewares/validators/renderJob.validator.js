const VALID_ENGINES = ["Cycles", "Eevee", "Arnold", "Redshift", "Octane"];

export const createRenderJobValidator = (req) => {
  const errors = [];
  const { sceneName, animator, renderEngine, totalFrames, samplesPerPixel } = req.body || {};

  if (!req.body || Object.keys(req.body).length === 0) {
    return [{ field: "body", message: "El cuerpo de la petición no puede estar vacío." }];
  }

  if (!sceneName || typeof sceneName !== "string" || sceneName.trim().length < 3) {
    errors.push({ field: "sceneName", message: "El nombre de la escena 3D debe tener al menos 3 caracteres." });
  }

  if (!animator || typeof animator !== "string" || animator.trim().length < 3) {
    errors.push({ field: "animator", message: "El nombre del animador 3D es requerido." });
  }

  if (!renderEngine || !VALID_ENGINES.includes(renderEngine.trim())) {
    errors.push({ field: "renderEngine", message: `Motor de render inválido. Válidos: ${VALID_ENGINES.join(", ")}.` });
  }

  const frames = Number(totalFrames);
  if (isNaN(frames) || frames < 1 || frames > 10000) {
    errors.push({ field: "totalFrames", message: "La cantidad de fotogramas debe estar entre 1 y 10,000." });
  }

  const samples = Number(samplesPerPixel);
  if (isNaN(samples) || samples < 32 || samples > 4096) {
    errors.push({ field: "samplesPerPixel", message: "Las muestras por píxel (samples) deben estar entre 32 y 4,096." });
  }

  return errors;
};
