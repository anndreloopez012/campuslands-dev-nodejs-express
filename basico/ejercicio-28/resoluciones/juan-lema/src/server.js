import app from "./app.js";
import config from "./config/index.js";

app.listen(config.port, () => {
  console.log(`API battle royale [${config.env}] escuchando en http://localhost:${config.port}`);
});
