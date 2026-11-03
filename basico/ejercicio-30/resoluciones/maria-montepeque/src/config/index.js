const ENVIRONMENTS = ["development", "production"];

const schema = {
    PORT: { type: "number", default: 3030 },
    DATA_FILE: { type: "string", default: "data/db.json" },
    LOG_LEVEL: { type: "string", default: { development: "debug", production: "info" } },
    LOG_FORMAT: { type: "string", default: { development: "pretty", production: "json" } },
    LABOR_RATE_PER_HOUR: { type: "number", default: 45000 },
    BODY_LIMIT_KB: { type: "number", default: 16 },
    FEATURE_DEBUG_ROUTES: { type: "boolean", default: { development: true, production: false } },
};

const parsers = {
    number: (raw) => (raw !== "" && Number.isFinite(Number(raw)) ? Number(raw) : undefined),
    string: (raw) => raw.trim() || undefined,
    boolean: (raw) => ({ true: true, false: false })[raw.toLowerCase()],
};

function loadConfig(source = process.env) {
    const flag = process.argv.find((arg) => arg.startsWith("--env="))?.split("=")[1];
    const env = flag ?? source.NODE_ENV ?? "development";
    if (!ENVIRONMENTS.includes(env)) throw new Error(`Entorno "${env}" no soportado (${ENVIRONMENTS.join(", ")})`);

    const config = { env };
    const errors = [];

    for (const [key, rule] of Object.entries(schema)) {
        const fallback = typeof rule.default === "object" ? rule.default[env] : rule.default;
        const raw = source[key];

        config[key] = raw === undefined ? fallback : parsers[rule.type](raw);
        if (config[key] === undefined) errors.push(`${key}="${raw}" no es un ${rule.type} valido`);
    }

    if (errors.length > 0) throw new Error(`Configuracion invalida:\n- ${errors.join("\n- ")}`);
    return Object.freeze(config);
}

export { loadConfig };
