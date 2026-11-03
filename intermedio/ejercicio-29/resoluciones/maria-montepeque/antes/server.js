import { crearApp } from "./app.js";

const PORT = process.env.PORT || 3029;

crearApp().listen(PORT, () => {
    console.log(`Servidor (version ANTES del refactor) en http://localhost:${PORT}`);
});
