const TYPE_CHECKS = {
  string: (value) => typeof value === "string",
  number: (value) => typeof value === "number" && Number.isFinite(value),
  boolean: (value) => typeof value === "boolean",
  array: (value) => Array.isArray(value),
  object: (value) => typeof value === "object" && value !== null && !Array.isArray(value),
};

function isPresent(value) {
  return value !== undefined && value !== null;
}

function validateFieldSchema(schema, value, path, errors, sanitized) {
  if (isPresent(value) && !TYPE_CHECKS[schema.type](value)) {
    errors.push(`${path} debe ser de tipo ${schema.type}`);
    return;
  }

  switch (schema.type) {
    case "string": {
      if (!isPresent(value)) return;
      const trimmed = value.trim();
      if (schema.minLength && trimmed.length < schema.minLength) {
        errors.push(`${path} debe tener al menos ${schema.minLength} caracteres`);
      }
      if (schema.maxLength && trimmed.length > schema.maxLength) {
        errors.push(`${path} debe tener a lo sumo ${schema.maxLength} caracteres`);
      }
      if (schema.pattern && !schema.pattern.test(trimmed)) {
        errors.push(`${path} no cumple el formato esperado`);
      }
      if (schema.enum && !schema.enum.includes(trimmed)) {
        errors.push(`${path} debe ser uno de: ${schema.enum.join(", ")}`);
      }
      sanitized.value = trimmed;
      break;
    }
    case "number": {
      if (!isPresent(value)) return;
      if (schema.integer && !Number.isInteger(value)) {
        errors.push(`${path} debe ser un numero entero`);
      }
      if (schema.min !== undefined && value < schema.min) {
        errors.push(`${path} debe ser mayor o igual a ${schema.min}`);
      }
      if (schema.max !== undefined && value > schema.max) {
        errors.push(`${path} debe ser menor o igual a ${schema.max}`);
      }
      sanitized.value = value;
      break;
    }
    case "array": {
      if (!isPresent(value)) return;
      if (schema.minItems !== undefined && value.length < schema.minItems) {
        errors.push(`${path} debe contener al menos ${schema.minItems} elemento(s)`);
      }
      if (schema.maxItems !== undefined && value.length > schema.maxItems) {
        errors.push(`${path} debe contener a lo sumo ${schema.maxItems} elemento(s)`);
      }
      sanitized.value = value.map((item, index) => {
        const itemSanitized = {};
        validateFieldSchema(schema.items, item, `${path}[${index}]`, errors, itemSanitized);
        return itemSanitized.value;
      });
      break;
    }
    case "boolean": {
      sanitized.value = value;
      break;
    }
    case "object": {
      if (!isPresent(value)) return;
      if (schema.properties) {
        sanitized.value = validateObjectSchema(schema, value, path, errors);
      }
      break;
    }
    default:
      sanitized.value = value;
  }
}

function validateObjectSchema(schema, data, path, errors) {
  const properties = schema.properties || {};
  const allowedKeys = Object.keys(properties);
  const cleaned = {};

  if (schema.strict) {
    for (const key of Object.keys(data)) {
      if (!allowedKeys.includes(key)) {
        errors.push(`${path}.${key} no es un campo permitido`);
      }
    }
  }

  for (const key of allowedKeys) {
    const keySchema = properties[key];
    const raw = data[key];
    if (!isPresent(raw)) {
      if (keySchema.required) {
        errors.push(`${path}.${key} es obligatorio`);
      } else if ("default" in keySchema) {
        cleaned[key] = keySchema.default;
      }
      continue;
    }
    const sanitized = {};
    validateFieldSchema(keySchema, raw, `${path}.${key}`, errors, sanitized);
    cleaned[key] = sanitized.value;
  }

  return cleaned;
}

/**
 * Valida `data` contra `schema` (tipo object).
 * Devuelve { ok, errors, value } donde `value` es una copia saneada
 * (solo campos declarados, strings recortados y defaults aplicados).
 */
function validate(schema, data) {
  const errors = [];
  if (!TYPE_CHECKS.object(data)) {
    return { ok: false, errors: ["El cuerpo de la peticion debe ser un objeto JSON"], value: null };
  }
  const value = validateObjectSchema(schema, data, "$", errors);
  return { ok: errors.length === 0, errors, value };
}

module.exports = { validate };
