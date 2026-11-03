import express from "express";
import personajeRoutes from "./routes/personajeRoutes.js";

const app = express();

const PORT = 3000;

app.get("/", (req, res) => {
  res.json({
    mensaje: "RPG Backend funcionando"
  });
});

app.use("/personaje", personajeRoutes);

app.listen(PORT, () => {
  console.log(`RPG Backend iniciado en http://localhost:${PORT}`);
});
