import http from "node:http";
import { handleRequest } from "./app.js";

const PORT = process.env.PORT || 3015;

http.createServer(handleRequest).listen(PORT, () => {
    console.log(`Food trucks API escuchando en http://localhost:${PORT}`);
});