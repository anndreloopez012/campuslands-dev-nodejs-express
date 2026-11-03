import http from "node:http";

// servidor chiquito que hace de "API externa" para probar la app a mano
// npm run proveedor  y en otra terminal  npm start
const STATS = {
    viper: { kills: 4200, muertes: 1500, victorias: 330, partidas: 500 },
    nova: { kills: 3100, muertes: 2000, victorias: 260, partidas: 480 },
    ghost: { kills: 1800, muertes: 1900, victorias: 150, partidas: 350 },
    blaze: { kills: 2500, muertes: 1200, victorias: 290, partidas: 450 },
    rook: { kills: 900, muertes: 1600, victorias: 90, partidas: 300 },
    echo: { kills: 2000, muertes: 1400, victorias: 200, partidas: 400 }
};

const PORT = process.env.PROVEEDOR_PORT || 4026;

http.createServer((req, res) => {
    const match = req.url.match(/^\/stats\/([^/]+)$/);
    const tag = match ? decodeURIComponent(match[1]).toLowerCase() : null;

    // "lento" sirve para probar el timeout
    if (tag === "lento") {
        setTimeout(() => res.end("{}"), 5000);
        return;
    }

    if (!tag || !STATS[tag]) {
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "no existe" }));
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(STATS[tag]));
}).listen(PORT, () => {
    console.log(`Proveedor falso en http://localhost:${PORT} (jugadores: ${Object.keys(STATS).join(", ")}, lento)`);
});
