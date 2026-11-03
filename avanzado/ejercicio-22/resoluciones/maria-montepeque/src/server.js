import { crearApp } from "./app.js";

const PORT = process.env.PORT || 4022;

if (!process.env.SECRETO_GRANJA) console.warn("Ojo: usando el secreto de desarrollo, define SECRETO_GRANJA en .env");

crearApp().listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
