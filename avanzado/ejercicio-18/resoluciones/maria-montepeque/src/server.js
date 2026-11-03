import { crearApp } from "./app.js";

const PORT = process.env.PORT || 4018;

crearApp().listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
