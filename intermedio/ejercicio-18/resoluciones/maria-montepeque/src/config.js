import "dotenv/config";

const config = {
    port: process.env.PORT || 3018,
    // cada ronda mas duplica el tiempo del hash, 10 es lo normal
    bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 10
};

export default config;
