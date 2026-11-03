import http from "node:http";
import { handleRequest } from "./app.js";

const PORT = process.env.PORT || 3017;

http.createServer(handleRequest).listen(PORT, () => {
    console.log(`Travel Tours API escuchando en http://localhost:${PORT}`);
});