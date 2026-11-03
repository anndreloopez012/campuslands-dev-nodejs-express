import app from "./app.js";

const PORT = process.env.PORT || 3011;

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
