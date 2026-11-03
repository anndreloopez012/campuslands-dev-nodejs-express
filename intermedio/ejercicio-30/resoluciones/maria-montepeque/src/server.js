import config from "./config.js";
import app from "./app.js";

app.listen(config.port, () => {
    console.log(`Taller de motos escuchando en http://localhost:${config.port} (${config.nodeEnv})`);
    if (config.jwtSecret === "secreto-solo-para-desarrollo") {
        console.warn("Aviso: no hay JWT_SECRET en .env, se usa uno de desarrollo");
    }
});
