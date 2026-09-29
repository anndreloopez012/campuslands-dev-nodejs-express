import express from "express";
import routes from "./routes/index.js";

const app = express();

app.use(express.json());
app.use(routes);

app.use((req, res) => {
  res.status(404).json({ ok: false, message: "Ruta no encontrada" });
});

export default app;
