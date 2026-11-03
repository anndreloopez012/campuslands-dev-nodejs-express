export const createBlueprintValidator = (req) => {
  const errors = [];
  const { projectName, architect, scale } = req.body || {};

  if (!req.body || Object.keys(req.body).length === 0) {
    return [{ field: "body", message: "El cuerpo de la petición no puede estar vacío." }];
  }

  if (!projectName || typeof projectName !== "string" || projectName.trim().length < 3) {
    errors.push({ field: "projectName", message: "El nombre del proyecto arquitectónico debe tener mínimo 3 caracteres." });
  }

  if (!architect || typeof architect !== "string" || architect.trim().length < 3) {
    errors.push({ field: "architect", message: "El nombre del arquitecto responsable es obligatorio." });
  }

  if (!scale || typeof scale !== "string" || !/^1:\d+$/.test(scale.trim())) {
    errors.push({ field: "scale", message: "La escala debe seguir el formato estándar 1:N (ej. 1:100, 1:50)." });
  }

  return errors;
};
