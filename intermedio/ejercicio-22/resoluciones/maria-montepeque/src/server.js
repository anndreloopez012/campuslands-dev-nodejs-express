import config from "./config.js";
import app from "./app.js";

app.listen(config.port, () => {
    console.log(`Servidor escuchando en http://localhost:${config.port}`);
    console.log(`Maximo ${config.maxArchivosPorSubida} archivos de ${config.maxArchivoMb} MB por subida`);
});
