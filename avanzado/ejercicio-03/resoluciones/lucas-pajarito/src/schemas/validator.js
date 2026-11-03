function validateAgainstSchema(payload, schema) {
  const errors = [];
  const cleanData = {};

  for (const [field, rules] of Object.entries(schema)) {
    const value = payload ? payload[field] : undefined;

    if (rules.required && (value === undefined || value === null || value === "")) {
      errors.push({ field, message: `${field} es obligatorio` });
      continue;
    }

    if (value === undefined || value === null) {
      continue;
    }

    if (rules.type === "string") {
      if (typeof value !== "string") {
        errors.push({ field, message: `${field} debe ser texto` });
        continue;
      }
      const trimmed = value.trim();
      if (rules.minLength && trimmed.length < rules.minLength) {
        errors.push({ field, message: `${field} debe tener al menos ${rules.minLength} caracteres` });
      }
      if (rules.enum && !rules.enum.includes(trimmed)) {
        errors.push({ field, message: `${field} debe ser uno de: ${rules.enum.join(", ")}` });
      }
      cleanData[field] = trimmed;
    } else if (rules.type === "number") {
      const num = Number(value);
      if (typeof value === "boolean" || Number.isNaN(num)) {
        errors.push({ field, message: `${field} debe ser numerico` });
        continue;
      }
      if (rules.min !== undefined && num < rules.min) {
        errors.push({ field, message: `${field} debe ser mayor o igual a ${rules.min}` });
      }
      if (rules.max !== undefined && num > rules.max) {
        errors.push({ field, message: `${field} debe ser menor o igual a ${rules.max}` });
      }
      cleanData[field] = num;
    }
  }

  return { valid: errors.length === 0, errors, data: cleanData };
}

function validateBody(schema) {
  return (req, res, next) => {
    const { valid, errors, data } = validateAgainstSchema(req.body || {}, schema);
    if (!valid) {
      res.status(422).json({
        ok: false,
        message: "Error de validacion de schema",
        errors,
      });
      return;
    }
    req.validatedBody = data;
    next();
  };
}

export { validateAgainstSchema, validateBody };
