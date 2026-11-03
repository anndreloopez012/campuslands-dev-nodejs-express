import { crearApp } from "./app.js";

const PORT = process.env.PORT || 4023;

const app = crearApp();
// el planificador revisa cada 10 segundos si le toca algo
app.locals.planificador.iniciar();

const server = app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

// al apagar se detienen los jobs
process.on("SIGINT", () => {
    app.locals.planificador.detener();
    server.close(() => process.exit(0));
});
