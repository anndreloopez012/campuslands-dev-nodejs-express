import config from "./config/env.js";
import app from "./app.js";

app.listen(config.port, () => {
    console.log(`${config.estudio.nombre} escuchando en http://localhost:${config.port} (${config.nodeEnv})`);
});
