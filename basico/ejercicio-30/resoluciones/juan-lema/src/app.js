import express from "express";
import routes from "./routes/index.js";
import { requestLogger } from "./middlewares/request-logger.js";
import { errorHandler } from "./middlewares/error-handler.js";

const app = express();

app.use(requestLogger);
app.use(express.json());
app.use(routes);

app.use((req, res) => {
  res.status(404).json({ ok: false, message: "Ruta no encontrada" });
});

app.use(errorHandler);

export default app;
