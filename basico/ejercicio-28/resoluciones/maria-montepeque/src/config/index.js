import { ENVIRONMENTS, schema } from "./schema.js";

const parsers = {
    number: (raw) => (Number.isFinite(Number(raw)) && raw !== "" ? Number(raw) : undefined),
    string: (raw) => (raw.trim() ? raw.trim() : undefined),
    boolean: (raw) => ({ true: true, "1": true, false: false, "0": false })[raw.toLowerCase()],
    list: (raw) => raw.split(",").map((item) => item.trim()).filter(Boolean),
};

function resolveEnvironment() {
    const flag = process.argv.find((arg) => arg.startsWith("--env="))?.split("=")[1];
    const env = flag ?? process.env.NODE_ENV ?? "development";

    if (!ENVIRONMENTS.includes(env)) {
        throw new Error(`Entorno "${env}" no soportado. Usa: ${ENVIRONMENTS.join(", ")}`);
    }
    return env;
}

function loadConfig(source = process.env) {
    const env = resolveEnvironment();
    const values = { env };
    const sources = { env: "flag/NODE_ENV" };
    const errors = [];

    for (const [key, rule] of Object.entries(schema)) {
        const raw = source[key];
        const fallback = typeof rule.default === "object" && !Array.isArray(rule.default) ? rule.default[env] : rule.default;

        if (raw !== undefined) {
            const parsed = parsers[rule.type](raw);
            if (parsed === undefined) errors.push(`${key}="${raw}" no es un ${rule.type} valido`);
            values[key] = parsed;
            sources[key] = "environment";
        } else {
            values[key] = fallback;
            sources[key] = fallback === undefined ? "missing" : "default";
        }

        if (values[key] === undefined && rule.required?.includes(env)) {
            errors.push(`${key} es obligatoria en ${env}`);
        }
    }

    if (errors.length > 0) {
        throw new Error(`Configuracion invalida:\n- ${errors.join("\n- ")}`);
    }

    return Object.freeze({ values, sources });
}

function redact(values) {
    return Object.fromEntries(
        Object.entries(values).map(([key, value]) => [key, schema[key]?.secret && value ? `${String(value).slice(0, 3)}***` : value])
    );
}

export { loadConfig, redact };
