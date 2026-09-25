import http from "node:http";
import { handleRequest } from "./app.js";

const PORT = process.env.PORT || 3026;

http.createServer(handleRequest).listen(PORT, () => {
    console.log(`Arena Shooter API escuchando en http://localhost:${PORT}`);
});
