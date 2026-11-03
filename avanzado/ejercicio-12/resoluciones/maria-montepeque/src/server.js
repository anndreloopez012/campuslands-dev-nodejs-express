import { crearApp } from "./app.js";

const PORT = process.env.PORT || 4012;

crearApp().listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
