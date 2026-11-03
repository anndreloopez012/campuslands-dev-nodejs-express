import config from "./config.js";
import app from "./app.js";

app.listen(config.port, () => {
    console.log(`Servidor escuchando en http://localhost:${config.port}`);
    console.log(`Limite general: ${config.limiteGeneral.max} cada ${config.limiteGeneral.ventanaMs / 1000}s`);
    console.log(`Limite renders: ${config.limiteRender.max} cada ${config.limiteRender.ventanaMs / 1000}s`);
});
