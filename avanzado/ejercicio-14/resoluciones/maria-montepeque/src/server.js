import { crearApp } from "./app.js";

const PORT = process.env.PORT || 4014;

crearApp().listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
    console.log(`Metricas en http://localhost:${PORT}/metrics`);
});
