import { crearApp } from "./app.js";

const PORT = process.env.PORT || 4024;

crearApp().listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
    console.log(`Documentacion en http://localhost:${PORT}/docs`);
});
