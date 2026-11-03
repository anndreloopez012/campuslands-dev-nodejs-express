import app from "./app.js";

const PORT = process.env.PORT || 4004;

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
    console.log(`Catalogo de errores: http://localhost:${PORT}/api/errores`);
});
