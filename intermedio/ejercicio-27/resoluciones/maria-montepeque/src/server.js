import app from "./app.js";

const PORT = process.env.PORT || 3027;

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
    console.log(`Documentacion en http://localhost:${PORT}/docs`);
});
