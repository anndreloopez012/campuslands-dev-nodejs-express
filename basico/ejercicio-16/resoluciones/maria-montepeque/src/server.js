import { app } from "./app.js";

const PORT = process.env.PORT || 3016;

app.listen(PORT, () => {
    console.log(`Sneaker Drops API escuchando en http://localhost:${PORT}`);
});