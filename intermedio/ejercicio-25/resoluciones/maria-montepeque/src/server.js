import { crearApp } from "./app.js";

const PORT = process.env.PORT || 3025;

if (!process.env.GM_TOKEN) {
    console.warn('Aviso: no hay GM_TOKEN, se usa "token-del-gm"');
}

crearApp().listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
