import * as repo from "../repositories/drafts.inMemory.repository.js";
import { AppError, BadRequestError, ConflictError, NotFoundError } from "../utils/customErrors.js";
export const draftSchema = {
  matchCode: { type: "string", minLength: 4, required: true },
  teamName: { type: "string", minLength: 2, required: true },
  coach: { type: "string", minLength: 2, required: true },
  picks: { type: "array", exactLength: 5, required: true },
  bans: { type: "array", minItems: 1, required: true }
};

export const validateWithSchema = (schema, payload = {}) => {
  const errors = [];
  for (const [field, rules] of Object.entries(schema)) {
    const val = payload[field];
    if (rules.required && (val === undefined || val === null || val === "")) {
      errors.push(`El campo '${field}' es requerido por el schema.`);
      continue;
    }
    if (rules.type === "string" && typeof val !== "string") {
      errors.push(`El campo '${field}' debe ser de tipo string.`);
    } else if (rules.type === "string" && rules.minLength && val.trim().length < rules.minLength) {
      errors.push(`El campo '${field}' debe tener al menos ${rules.minLength} caracteres.`);
    }
    if (rules.type === "array") {
      if (!Array.isArray(val)) {
        errors.push(`El campo '${field}' debe ser un arreglo.`);
      } else {
        if (rules.exactLength && val.length !== rules.exactLength) {
          errors.push(`El campo '${field}' debe contener exactamente ${rules.exactLength} campeones.`);
        }
        if (rules.minItems && val.length < rules.minItems) {
          errors.push(`El campo '${field}' debe contener al menos ${rules.minItems} elemento(s).`);
        }
      }
    }
  }
  return errors;
};

export const listItemsService = async () => repo.findAll();

export const getItemByIdService = async (id) => {
  const item = await repo.findById(id);
  if (!item) throw new NotFoundError(`El draft MOBA '${id}' no existe.`);
  return item;
};

export const createItemService = async (payload) => {
  const schemaErrors = validateWithSchema(draftSchema, payload);
  if (schemaErrors.length > 0) {
    throw new BadRequestError("El payload no cumple con el schema de Draft MOBA.", schemaErrors);
  }
  const all = await repo.findAll();
  return repo.save({
    id: `DRF-0${all.length + 1}`,
    matchCode: payload.matchCode.trim().toUpperCase(),
    teamName: payload.teamName.trim(),
    coach: payload.coach.trim(),
    picks: payload.picks,
    bans: payload.bans
  });
};
