import "dotenv/config";

// si no hay .env uso valores de desarrollo para que igual arranque
const config = {
    port: process.env.PORT || 3015,
    jwtSecret: process.env.JWT_SECRET || "secreto-solo-para-desarrollo",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h"
};

if (!process.env.JWT_SECRET) {
    console.warn("Aviso: no hay JWT_SECRET en .env, se usa uno de desarrollo");
}

export default config;
