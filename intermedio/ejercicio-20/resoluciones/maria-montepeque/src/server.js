import config from "./config.js";
import app from "./app.js";

app.listen(config.port, () => {
    console.log(`Servidor escuchando en http://localhost:${config.port}`);
    console.log(`Origenes permitidos: ${config.corsOrigins.join(", ")}`);
});
