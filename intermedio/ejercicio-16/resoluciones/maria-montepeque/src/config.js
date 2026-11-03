import "dotenv/config";

// valores por defecto para que arranque sin .env
const config = {
    port: process.env.PORT || 3016,
    jwtSecret: process.env.JWT_SECRET || "secreto-solo-para-desarrollo",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h"
};

if (!process.env.JWT_SECRET) {
    console.warn("Aviso: no hay JWT_SECRET en .env, se usa uno de desarrollo");
}

export default config;
