import { HttpError } from "./errors.js";

const checks = {
    string: (v) => typeof v === "string" && v.trim().length > 0,
    integer: (v) => Number.isInteger(v),
    number: (v) => typeof v === "number" && Number.isFinite(v),
    array: (v) => Array.isArray(v) && v.length > 0,
};

function validate(schema, input, { partial = false } = {}) {
    const details = [];
    const data = {};

    for (const [field, rule] of Object.entries(schema)) {
        const value = input?.[field];

        if (value === undefined) {
            if (!partial && rule.required !== false) details.push({ field, message: "es obligatorio" });
            continue;
        }

        if (!checks[rule.type](value)) details.push({ field, message: `debe ser ${rule.type}` });
        else if (rule.enum && !rule.enum.includes(value)) details.push({ field, message: `debe ser uno de: ${rule.enum.join(", ")}` });
        else if (rule.min !== undefined && value < rule.min) details.push({ field, message: `debe ser >= ${rule.min}` });
        else if (rule.max !== undefined && value > rule.max) details.push({ field, message: `debe ser <= ${rule.max}` });
        else if (rule.pattern && !rule.pattern.test(value)) details.push({ field, message: rule.hint ?? "formato invalido" });
        else data[field] = typeof value === "string" ? value.trim() : value;
    }

    if (details.length > 0) throw HttpError.unprocessable("Datos invalidos", details);
    return data;
}

export { validate };
