/**
 * Schemas de entidades MOBA. Cada campo declara tipo, reglas y requerimiento.
 * "strict: true" rechaza llaves no declaradas (evita payloads con basura).
 */
const heroSchema = {
  type: "object",
  strict: true,
  properties: {
    name: {
      type: "string",
      required: true,
      minLength: 2,
      maxLength: 18,
      pattern: /^[A-Za-z][A-Za-z0-9 _]*$/,
    },
    role: {
      type: "string",
      required: true,
      enum: ["carry", "support", "tank", "assassin"],
    },
    difficulty: {
      type: "number",
      required: true,
      integer: true,
      min: 1,
      max: 10,
      default: 3,
    },
    stats: {
      type: "object",
      required: true,
      strict: true,
      properties: {
        hp: { type: "number", required: true, min: 100 },
        mana: { type: "number", required: true, min: 0 },
        attackDamage: { type: "number", required: true, min: 0 },
        spellPower: { type: "number", required: true, min: 0 },
      },
    },
    abilities: {
      type: "array",
      required: true,
      minItems: 1,
      items: {
        type: "object",
        strict: true,
        properties: {
          name: { type: "string", required: true, maxLength: 24 },
          cooldown: { type: "number", required: true, min: 0 },
          manaCost: { type: "number", required: true, min: 0 },
        },
      },
    },
  },
};

module.exports = { heroSchema };
