import { crearApp } from "./app.js";

const PORT = process.env.PORT || 4021;

crearApp({ msPorFrame: 50 }).listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
