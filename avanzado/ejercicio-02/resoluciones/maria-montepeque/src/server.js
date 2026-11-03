import config from "./config.js";
import { crearContenedor } from "./contenedor.js";
import { crearApp } from "./app.js";

const contenedor = crearContenedor({ repo: config.repo, dataDir: config.dataDir });
const app = crearApp(contenedor);

app.listen(config.port, () => {
    console.log(`Servidor escuchando en http://localhost:${config.port}`);
    console.log(`Repositorio: ${config.repo}${config.repo === "archivo" ? ` (${config.dataDir})` : ""}`);
    console.log(`Modulos: ${contenedor.modulos.map((m) => m.nombre).join(", ")}`);
});
