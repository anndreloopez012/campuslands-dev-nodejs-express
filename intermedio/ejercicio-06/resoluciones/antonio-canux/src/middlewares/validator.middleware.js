export const validateBody = (rules) => {
  return (req, res, next) => {
    const errors = [];
    const body = req.body || {};

    for (const [field, rule] of Object.entries(rules)) {
      const value = body[field];

      // Validar presencia
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push({ field, message: `El campo '${field}' es obligatorio.` });
        continue;
      }

      // Si el campo es opcional y no viene, omitimos las demás reglas
      if (!rule.required && (value === undefined || value === null || value === '')) {
        continue;
      }

      // Validar tipo
      if (rule.type && typeof value !== rule.type) {
        errors.push({ field, message: rule.message || `El campo '${field}' debe ser de tipo ${rule.type}.` });
        continue;
      }

      // Validar longitud de strings
      if (rule.minLength && typeof value === 'string' && value.trim().length < rule.minLength) {
        errors.push({ field, message: rule.message });
      }

      // Validar rangos numéricos
      if (rule.min !== undefined && typeof value === 'number' && value < rule.min) {
        errors.push({ field, message: rule.message });
      }
      if (rule.max !== undefined && typeof value === 'number' && value > rule.max) {
        errors.push({ field, message: rule.message });
      }

      // Validar valores permitidos (enum)
      if (rule.enum && !rule.enum.includes(value)) {
        errors.push({ field, message: rule.message });
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        ok: false,
        message: "Errores de validación en los datos enviados",
        errors
      });
    }

    next();
  };
};