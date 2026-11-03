import http from "node:http";

// servidor.js: SOLO lo de red
// - crear el servidor http con la app
// - iniciar en un puerto (y avisar bonito si esta ocupado)
// - apagar ordenado: no aceptar mas, esperar lo que esta en camino, y si tarda mucho cortar
export function crearServidor(app, { puerto = 0, host = "127.0.0.1", tiempoApagadoMs = 10_000, log = () => {} } = {}) {
    const servidor = http.createServer(app);
    let estado = "detenido";
    let enCurso = 0;
    let apagado = null;

    // cuento las peticiones que estan siendo atendidas
    servidor.on("request", (req, res) => {
        enCurso++;
        res.once("close", () => enCurso--);
    });

    function iniciar() {
        if (estado !== "detenido") return Promise.reject(new Error(`No se puede iniciar, el servidor esta ${estado}`));
        estado = "iniciando";
        return new Promise((resolver, rechazar) => {
            const alFallar = (err) => {
                estado = "detenido";
                if (err.code === "EADDRINUSE") rechazar(new Error(`El puerto ${puerto} ya esta en uso, cierra el otro proceso o cambia PORT`));
                else rechazar(err);
            };
            servidor.once("error", alFallar);
            servidor.listen(puerto, host, () => {
                servidor.off("error", alFallar);
                estado = "escuchando";
                const { port } = servidor.address();
                log(`escuchando en http://${host}:${port}`);
                resolver({ puerto: port, url: `http://${host}:${port}` });
            });
        });
    }

    function detener() {
        // si ya se estaba apagando, devuelvo la misma promesa (llamar 2 veces no rompe)
        if (apagado) return apagado;
        if (estado !== "escuchando") return Promise.resolve({ forzado: false, pendientes: 0 });

        estado = "apagando";
        app.locals.apagando = true;
        log(`apagando... ${enCurso} peticiones en curso`);

        apagado = new Promise((resolver) => {
            let forzado = false;
            // si las peticiones tardan demasiado, corto todo
            const limite = setTimeout(() => {
                forzado = true;
                log(`se paso el tiempo (${tiempoApagadoMs} ms), cerrando ${enCurso} a la fuerza`);
                servidor.closeAllConnections();
            }, tiempoApagadoMs);

            // close: deja de aceptar conexiones nuevas y termina cuando no queda ninguna
            servidor.close(() => {
                clearTimeout(limite);
                estado = "detenido";
                log(forzado ? "apagado forzado" : "apagado limpio");
                resolver({ forzado, pendientes: enCurso });
            });
            // las conexiones keep-alive que no estan haciendo nada se cierran ya
            servidor.closeIdleConnections();
        });
        return apagado;
    }

    return { iniciar, detener, estado: () => estado, enCurso: () => enCurso };
}
