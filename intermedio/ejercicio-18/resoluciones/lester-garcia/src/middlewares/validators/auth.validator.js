const VALID_LICENSES = ["Tandem_Student", "USPA_A", "USPA_B", "USPA_C", "Instructor_Tandem"];

export const registerValidator = (req) => {
  const errors = [];
  const { name, email, password, licenseLevel } = req.body;

  if (!req.body || Object.keys(req.body).length === 0) {
    return [{ field: "body", message: "El cuerpo de la petición no puede estar vacío." }];
  }

  if (!name || typeof name !== "string" || name.trim().length < 3) {
    errors.push({ field: "name", message: "El nombre debe tener al menos 3 caracteres." });
  }

  if (!email || typeof email !== "string" || !email.includes("@")) {
    errors.push({ field: "email", message: "Debe ingresar un correo electrónico válido." });
  }

  if (!password || typeof password !== "string" || password.length < 8) {
    errors.push({ field: "password", message: "La contraseña debe tener al menos 8 caracteres para seguridad de la dropzone." });
  }

  if (licenseLevel && !VALID_LICENSES.includes(licenseLevel.trim())) {
    errors.push({ field: "licenseLevel", message: `Licencia inválida. Válidas: ${VALID_LICENSES.join(", ")}.` });
  }

  return errors;
};

export const loginValidator = (req) => {
  const errors = [];
  const { email, password } = req.body;

  if (!email || typeof email !== "string" || !email.includes("@")) {
    errors.push({ field: "email", message: "Email inválido o ausente." });
  }

  if (!password || typeof password !== "string") {
    errors.push({ field: "password", message: "Contraseña requerida." });
  }

  return errors;
};