export const loginValidator = (req) => {
  const errors = [];
  const { email, password } = req.body;

  if (!req.body || Object.keys(req.body).length === 0) {
    return [{ field: "body", message: "El cuerpo de la petición no puede estar vacío." }];
  }

  if (!email || typeof email !== "string" || !email.includes("@")) {
    errors.push({ field: "email", message: "Debe ingresar un email institucional válido." });
  }

  if (!password || typeof password !== "string" || password.trim().length < 6) {
    errors.push({ field: "password", message: "La contraseña debe contener al menos 6 caracteres." });
  }

  return errors;
};