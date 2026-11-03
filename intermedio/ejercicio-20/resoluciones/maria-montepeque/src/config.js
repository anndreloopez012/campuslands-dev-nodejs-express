import "dotenv/config";

// "a,b , c" => ["a", "b", "c"]
function leerLista(texto) {
    return (texto || "")
        .split(",")
        .map((origen) => origen.trim())
        .filter(Boolean);
}

const config = {
    port: Number(process.env.PORT) || 3020,
    corsOrigins: leerLista(process.env.CORS_ORIGINS || "http://localhost:5173")
};

export default config;
