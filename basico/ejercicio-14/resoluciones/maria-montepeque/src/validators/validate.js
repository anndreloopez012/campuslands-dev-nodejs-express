const rules = {
    required: (value) => (value === undefined || value === "" ? "es obligatorio" : null),
    string: (value) => (typeof value !== "string" ? "debe ser texto" : null),
    minLength: (value, min) => (value.length < min ? `debe tener al menos ${min} caracteres` : null),
    integer: (value) => (!Number.isInteger(Number(value)) ? "debe ser un numero entero" : null),
    min: (value, limit) => (Number(value) < limit ? `debe ser mayor o igual a ${limit}` : null),
    max: (value, limit) => (Number(value) > limit ? `debe ser menor o igual a ${limit}` : null),
    oneOf: (value, options) => (!options.includes(value) ? `debe ser uno de: ${options.join(", ")}` : null),
    pattern: (value, regex) => (!regex.test(value) ? "tiene un formato invalido" : null),
};

function validate(schema, input) {
    const errors = {};
    const data = {};

    for (const [field, config] of Object.entries(schema)) {
        const raw = typeof input[field] === "string" ? input[field].trim() : input[field];
        const fieldErrors = [];

        for (const [rule, arg] of Object.entries(config.rules)) {
            const message = rules[rule](raw ?? "", arg);
            if (message) {
                fieldErrors.push(message);
                if (rule === "required") break;
            }
        }

        if (fieldErrors.length > 0) {
            errors[field] = fieldErrors;
        } else {
            data[field] = config.cast ? config.cast(raw) : raw;
        }
    }

    return { valid: Object.keys(errors).length === 0, errors, data };
}

export { validate };