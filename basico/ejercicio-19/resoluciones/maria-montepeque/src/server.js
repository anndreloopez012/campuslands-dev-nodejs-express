import http from "node:http";
import { handleRequest } from "./app.js";

const PORT = process.env.PORT || 3019;

http.createServer(handleRequest).listen(PORT, () => {
    console.log(`Ink Studio API escuchando en http://localhost:${PORT}`);
});
