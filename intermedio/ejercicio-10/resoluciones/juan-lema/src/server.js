import app from "./app.js";

const PORT = process.env.PORT || 4010;

app.listen(PORT, () => {
  console.log(`API de pingpong escuchando en http://localhost:${PORT}`);
});
