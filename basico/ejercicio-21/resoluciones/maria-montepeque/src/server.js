import http from "node:http";
import { handleRequest } from "./app.js";

const PORT = process.env.PORT || 3021;

http.createServer(handleRequest).listen(PORT, () => {
    console.log(`Studio 3D API escuchando en http://localhost:${PORT}`);
});
