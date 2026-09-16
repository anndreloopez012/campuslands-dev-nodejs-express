const ENVIRONMENTS = ["development", "staging", "production"];

const schema = {
    PORT: { type: "number", default: 3028 },
    LOBBY_SIZE: { type: "number", default: { development: 4, staging: 20, production: 100 } },
    ZONE_SHRINK_SECONDS: { type: "number", default: { development: 10, staging: 60, production: 180 } },
    MAP_NAME: { type: "string", default: "Isla Delta" },
    FEATURE_RANKED: { type: "boolean", default: { development: true, staging: true, production: false } },
    FEATURE_DEBUG_ROUTES: { type: "boolean", default: { development: true, staging: false, production: false } },
    ANTICHEAT_KEY: { type: "string", secret: true, required: ["staging", "production"] },
    REGIONS: { type: "list", default: ["sa-east", "us-east"] },
};

export { ENVIRONMENTS, schema };
