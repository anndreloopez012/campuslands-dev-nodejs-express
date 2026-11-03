import { crearApp } from "./app.js";

const PORT = process.env.PORT || 4017;

if (!process.env.JWT_SECRET) console.warn("Aviso: no hay JWT_SECRET, se usa uno de desarrollo");

crearApp().listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
