import { crearApp } from "./app.js";
import { crearAlmacen } from "./datos/almacen.js";
import { sembrar } from "./semilla.js";

const PORT = process.env.PORT || 4026;

// en desarrollo arranca con datos de ejemplo hechos con las factories
const almacen = crearAlmacen();
console.log("datos de ejemplo:", sembrar(almacen));

crearApp({ almacen }).listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
