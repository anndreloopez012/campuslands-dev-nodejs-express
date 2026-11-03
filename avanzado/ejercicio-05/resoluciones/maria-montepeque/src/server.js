import { crearApp } from "./app.js";

const PORT = process.env.PORT || 4005;

crearApp().listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
