import app from "./app.js";
import { config } from "./config/index.js";

app.listen(config.port, () => {
  console.log(`${config.studio.name} (${config.env}) escuchando en http://localhost:${config.port}`);
});
