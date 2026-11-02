import http from "node:http";
import { handleRequest } from "./app.js";

const PORT = process.env.PORT || 3024;

http.createServer(handleRequest).listen(PORT, () => {
    console.log(`Chem Lab API escuchando en http://localhost:${PORT}`);
});
