import { BadRequestError } from "../../utils/customErrors.js";

const ALLOWED_CLASSES = ["Guerrero", "Mago", "Arquero", "Paladin", "Nigromante"];

export const validateHeroV1Payload = (req, res, next) => {
  const { name, characterClass, level, attackPower, defensePower } = req.body || {};
  const errors = [];

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.push("El campo 'name' es obligatorio y debe tener al menos 2 caracteres.");
  }

  if (!characterClass || !ALLOWED_CLASSES.includes(characterClass)) {
    errors.push(`El campo 'characterClass' debe ser uno de: ${ALLOWED_CLASSES.join(", ")}.`);
  }

  if (level === undefined || Number.isNaN(Number(level)) || Number(level) < 1 || Number(level) > 100) {
    errors.push("El campo 'level' debe ser un número entre 1 y 100.");
  }

  if (attackPower === undefined || Number.isNaN(Number(attackPower)) || Number(attackPower) < 1) {
    errors.push("El campo 'attackPower' (esquema v1) debe ser un número positivo.");
  }

  if (defensePower === undefined || Number.isNaN(Number(defensePower)) || Number(defensePower) < 1) {
    errors.push("El campo 'defensePower' (esquema v1) debe ser un número positivo.");
  }

  if (errors.length > 0) {
    return next(new BadRequestError("Error de validación en el contrato API v1.", errors));
  }

  next();
};

export const validateHeroV2Payload = (req, res, next) => {
  const { name, characterClass, level, guild, stats } = req.body || {};
  const errors = [];

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.push("El campo 'name' es obligatorio y debe tener al menos 2 caracteres.");
  }

  if (!characterClass || !ALLOWED_CLASSES.includes(characterClass)) {
    errors.push(`El campo 'characterClass' debe ser uno de: ${ALLOWED_CLASSES.join(", ")}.`);
  }

  if (level === undefined || Number.isNaN(Number(level)) || Number(level) < 1 || Number(level) > 100) {
    errors.push("El campo 'level' debe ser un número entre 1 y 100.");
  }

  if (!guild || typeof guild !== "string" || guild.trim().length < 2) {
    errors.push("El campo 'guild' es obligatorio en la versión v2 del contrato.");
  }

  if (!stats || typeof stats !== "object") {
    errors.push("El objeto anidado 'stats' ({ attack, defense, mana, critRate }) es obligatorio en v2.");
  } else {
    const { attack, defense, mana, critRate } = stats;
    if (attack === undefined || Number(attack) < 1) {
      errors.push("El atributo 'stats.attack' debe ser un número positivo.");
    }
    if (defense === undefined || Number(defense) < 1) {
      errors.push("El atributo 'stats.defense' debe ser un número positivo.");
    }
    if (mana === undefined || Number(mana) < 0) {
      errors.push("El atributo 'stats.mana' debe ser un número mayor o igual a 0.");
    }
    if (critRate !== undefined && (Number(critRate) < 0 || Number(critRate) > 100)) {
      errors.push("El atributo 'stats.critRate' debe estar entre 0 y 100.");
    }
  }

  if (errors.length > 0) {
    return next(new BadRequestError("Error de validación en el contrato API v2.", errors));
  }

  next();
};
