import http from "node:http";
import { app } from "./app.js";

const PORT = process.env.PORT || 3020;

http.createServer(app.handle).listen(PORT, () => {
    console.log(`Digital Canvas API escuchando en http://localhost:${PORT}`);
});
