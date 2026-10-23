const casters = {
    string: (value) => value,
    number: (value) => (value === "" || Number.isNaN(Number(value)) ? undefined : Number(value)),
    integer: (value) => (Number.isInteger(Number(value)) && value !== "" ? Number(value) : undefined),
};

function parseQuery(query, schema) {
    const values = {};
    const errors = [];

    for (const [key, rule] of Object.entries(schema)) {
        const raw = query[key];

        if (raw === undefined) {
            if (rule.default !== undefined) values[key] = rule.default;
            continue;
        }

        const value = casters[rule.type](raw);

        if (value === undefined) {
            errors.push(`${key} debe ser de tipo ${rule.type}`);
        } else if (rule.enum && !rule.enum.includes(value)) {
            errors.push(`${key} debe ser uno de: ${rule.enum.join(", ")}`);
        } else if (rule.min !== undefined && value < rule.min) {
            errors.push(`${key} debe ser mayor o igual a ${rule.min}`);
        } else if (rule.max !== undefined && value > rule.max) {
            errors.push(`${key} debe ser menor o igual a ${rule.max}`);
        } else {
            values[key] = value;
        }
    }

    return { values, errors };
}

export { parseQuery };
