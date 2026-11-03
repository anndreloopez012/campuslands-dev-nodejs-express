import { crearApp } from "./app.js";

const PORT = process.env.PORT || 4025;

// la partida se guarda en data/partida.json (esta en el .gitignore)
crearApp().listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
