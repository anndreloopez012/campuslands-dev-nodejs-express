import { crearAplicacion } from "./app.js";

const puerto = process.env.PUERTO || 3000;
const aplicacion = crearAplicacion();

aplicacion.listen(puerto, () => {
  console.log(`servidor escuchando en puerto ${puerto}`);
});
