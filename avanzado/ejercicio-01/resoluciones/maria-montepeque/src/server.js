import app from "./app.js";

const PORT = process.env.PORT || 4001;

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
    console.log("Versiones: /api/v1 (deprecada) y /api/v2 (actual)");
});
