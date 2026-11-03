import { crearApp } from "./app.js";

const PORT = process.env.PORT || 4015;

crearApp({ confiarProxy: process.env.TRUST_PROXY === "true" }).listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
    console.log(`Menu en http://localhost:${PORT}/menu`);
});
