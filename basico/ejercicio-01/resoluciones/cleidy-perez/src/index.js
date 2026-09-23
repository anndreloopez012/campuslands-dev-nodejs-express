const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("==================================================");
  console.log(`⚔️  Servidor RPG iniciado con éxito.`);
  console.log(`🌐 Escuchando en: http://localhost:${PORT}`);
  console.log(`📌 Entorno Node.js Versión: ${process.version}`);
  console.log(`📜 Modulo: BASICO 01 - Node runtime y consola`);
  console.log("==================================================");
});